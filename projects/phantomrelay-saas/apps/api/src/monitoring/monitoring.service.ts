import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  async getStats(userId: string) {
    const [scraperCount, runCount] = await Promise.all([
      this.prisma.scraper.count({ where: { userId } }),
      this.prisma.run.count({
        where: { scraper: { userId } },
      }),
    ]);

    return {
      scrapers: scraperCount,
      runs: runCount,
    };
  }
}
