import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { RunsService } from '../runs/runs.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../common/events/events.service';

export interface ScraperRunJobData {
  scraperId: string;
  userId: string;
  scheduleId: string;
}

@Processor('scraper-runs')
export class ScraperRunsProcessor extends WorkerHost {
  private readonly logger = new Logger(ScraperRunsProcessor.name);

  constructor(
    private readonly runsService: RunsService,
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {
    super();
  }

  async process(job: Job<ScraperRunJobData>): Promise<void> {
    const { scraperId, userId, scheduleId } = job.data;

    this.logger.log(
      `Processing scraper run job ${job.id} for scraper ${scraperId}`,
    );

    try {
      this.eventsService.emit({
        type: 'schedule.triggered',
        data: { scheduleId, scraperId },
      });

      this.eventsService.emit({
        type: 'run.started',
        data: { scraperId, jobId: job.id },
      });

      const run = await this.runsService.create(scraperId, userId);

      this.eventsService.emit({
        type: 'run.completed',
        data: { scraperId, runId: run.id, jobId: job.id },
      });

      // Update nextRunAt for repeatable jobs
      if (job.opts.repeat) {
        const nextRunAt = job.opts.repeat.every
          ? new Date(Date.now() + Number(job.opts.repeat.every))
          : undefined;

        if (nextRunAt) {
          await this.prisma.schedule.update({
            where: { id: scheduleId },
            data: { nextRunAt },
          });
        }
      }

      this.logger.log(
        `Completed scraper run job ${job.id} — run ${run.id}`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed scraper run job ${job.id}: ${message}`,
      );

      this.eventsService.emit({
        type: 'run.failed',
        data: { scraperId, jobId: job.id, error: message },
      });

      throw error;
    }
  }
}
