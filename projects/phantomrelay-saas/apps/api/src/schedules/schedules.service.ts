import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // TODO: Integrate BullMQ for job scheduling
  async create(scraperId: string, cron: string, userId: string) {
    this.logger.log(`Creating schedule for scraper ${scraperId}: ${cron}`);

    // Verify scraper ownership
    const scraper = await this.prisma.scraper.findFirst({
      where: { id: scraperId, userId },
    });

    if (!scraper) {
      throw new NotFoundException('Scraper not found');
    }

    return this.prisma.schedule.create({
      data: {
        scraperId,
        type: 'CRON',
        cron,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.schedule.findMany({
      where: { scraper: { userId } },
      include: { scraper: { select: { id: true, name: true, url: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string, userId: string) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id },
      include: { scraper: true },
    });

    if (!schedule || schedule.scraper.userId !== userId) {
      throw new NotFoundException('Schedule not found');
    }

    return this.prisma.schedule.delete({ where: { id } });
  }
}
