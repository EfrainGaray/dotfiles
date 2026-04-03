import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ScraperRunJobData } from './scraper-runs.processor';

export interface CreateScheduleDto {
  type: 'CRON' | 'INTERVAL' | 'ONCE';
  cron?: string;
  intervalMs?: number;
  delayMs?: number;
}

export interface UpdateScheduleDto {
  type?: 'CRON' | 'INTERVAL' | 'ONCE';
  cron?: string;
  intervalMs?: number;
  delayMs?: number;
}

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('scraper-runs') private readonly scraperQueue: Queue,
  ) {}

  async create(scraperId: string, userId: string, dto: CreateScheduleDto) {
    const scraper = await this.prisma.scraper.findFirst({
      where: { id: scraperId, userId },
    });

    if (!scraper) {
      throw new NotFoundException('Scraper not found');
    }

    // Check if scraper already has a schedule
    const existing = await this.prisma.schedule.findUnique({
      where: { scraperId },
    });

    if (existing) {
      throw new BadRequestException('Scraper already has a schedule');
    }

    const nextRunAt = this.calculateNextRunAt(dto);

    const schedule = await this.prisma.schedule.create({
      data: {
        scraperId,
        type: dto.type,
        cron: dto.cron,
        intervalMs: dto.intervalMs,
        nextRunAt,
        enabled: true,
      },
    });

    await this.addJobToQueue(schedule.id, scraperId, userId, dto);

    this.logger.log(
      `Created ${dto.type} schedule ${schedule.id} for scraper ${scraperId}`,
    );

    return schedule;
  }

  async update(id: string, userId: string, dto: UpdateScheduleDto) {
    const schedule = await this.findOneOrFail(id, userId);

    // Remove old job(s)
    await this.removeJobFromQueue(schedule.id);

    const merged = { type: dto.type ?? schedule.type, intervalMs: dto.intervalMs ?? schedule.intervalMs, delayMs: (dto as any).delayMs } as Pick<CreateScheduleDto, 'type' | 'intervalMs' | 'delayMs'>;
    const nextRunAt = this.calculateNextRunAt(merged);

    const updated = await this.prisma.schedule.update({
      where: { id },
      data: {
        type: dto.type ?? schedule.type,
        cron: dto.cron ?? schedule.cron,
        intervalMs: dto.intervalMs ?? schedule.intervalMs,
        nextRunAt,
      },
    });

    // Add new job with updated config
    const newDto: CreateScheduleDto = {
      type: updated.type as CreateScheduleDto['type'],
      cron: updated.cron ?? undefined,
      intervalMs: updated.intervalMs ?? undefined,
      delayMs: dto.delayMs,
    };

    await this.addJobToQueue(
      updated.id,
      updated.scraperId,
      userId,
      newDto,
    );

    this.logger.log(`Updated schedule ${id}`);
    return updated;
  }

  async remove(id: string, userId: string) {
    const schedule = await this.findOneOrFail(id, userId);

    await this.removeJobFromQueue(schedule.id);
    await this.prisma.schedule.delete({ where: { id } });

    this.logger.log(`Removed schedule ${id}`);
    return { deleted: true };
  }

  async pause(id: string, userId: string) {
    const schedule = await this.findOneOrFail(id, userId);

    await this.removeJobFromQueue(schedule.id);

    const updated = await this.prisma.schedule.update({
      where: { id },
      data: { enabled: false },
    });

    this.logger.log(`Paused schedule ${id}`);
    return updated;
  }

  async resume(id: string, userId: string) {
    const schedule = await this.findOneOrFail(id, userId);

    if (schedule.enabled) {
      throw new BadRequestException('Schedule is already active');
    }

    const dto: CreateScheduleDto = {
      type: schedule.type as CreateScheduleDto['type'],
      cron: schedule.cron ?? undefined,
      intervalMs: schedule.intervalMs ?? undefined,
    };

    await this.addJobToQueue(
      schedule.id,
      schedule.scraperId,
      userId,
      dto,
    );

    const updated = await this.prisma.schedule.update({
      where: { id },
      data: { enabled: true, nextRunAt: this.calculateNextRunAt(dto) },
    });

    this.logger.log(`Resumed schedule ${id}`);
    return updated;
  }

  async findAll(userId: string) {
    return this.prisma.schedule.findMany({
      where: { scraper: { userId } },
      include: {
        scraper: { select: { id: true, name: true, url: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.findOneOrFail(id, userId);
  }

  // --- Private helpers ---

  private async findOneOrFail(id: string, userId: string) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id },
      include: { scraper: true },
    });

    if (!schedule || schedule.scraper.userId !== userId) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  private async addJobToQueue(
    scheduleId: string,
    scraperId: string,
    userId: string,
    dto: CreateScheduleDto,
  ) {
    const jobData: ScraperRunJobData = { scraperId, userId, scheduleId };
    const jobId = `schedule-${scheduleId}`;

    switch (dto.type) {
      case 'CRON':
        if (!dto.cron) {
          throw new BadRequestException('Cron expression is required for CRON type');
        }
        await this.scraperQueue.upsertJobScheduler(
          jobId,
          { pattern: dto.cron },
          { name: 'scraper-run', data: jobData },
        );
        break;

      case 'INTERVAL':
        if (!dto.intervalMs || dto.intervalMs < 60_000) {
          throw new BadRequestException(
            'intervalMs is required and must be >= 60000 (1 minute)',
          );
        }
        await this.scraperQueue.upsertJobScheduler(
          jobId,
          { every: dto.intervalMs },
          { name: 'scraper-run', data: jobData },
        );
        break;

      case 'ONCE': {
        const delay = dto.delayMs ?? 0;
        await this.scraperQueue.add('scraper-run', jobData, {
          jobId,
          delay,
        });
        break;
      }
    }
  }

  private async removeJobFromQueue(scheduleId: string) {
    const jobId = `schedule-${scheduleId}`;

    try {
      // Remove repeatable job scheduler (CRON / INTERVAL)
      await this.scraperQueue.removeJobScheduler(jobId);
    } catch {
      // Scheduler might not exist if it was a ONCE job
    }

    try {
      // Remove delayed/waiting job (ONCE)
      const job = await this.scraperQueue.getJob(jobId);
      if (job) {
        await job.remove();
      }
    } catch {
      // Job might have already been processed
    }
  }

  private calculateNextRunAt(
    dto: Pick<CreateScheduleDto, 'type' | 'intervalMs' | 'delayMs'>,
  ): Date | undefined {
    switch (dto.type) {
      case 'INTERVAL':
        return dto.intervalMs
          ? new Date(Date.now() + dto.intervalMs)
          : undefined;
      case 'ONCE':
        return new Date(Date.now() + (dto.delayMs ?? 0));
      default:
        return undefined; // BullMQ handles CRON nextRunAt
    }
  }
}
