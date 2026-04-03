import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RelayService } from '../relay/relay.service';

@Injectable()
export class RunsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly relayService: RelayService,
  ) {}

  async create(scraperId: string, userId: string) {
    const scraper = await this.prisma.scraper.findFirst({
      where: { id: scraperId, userId },
    });

    if (!scraper) {
      throw new NotFoundException('Scraper not found');
    }

    const run = await this.prisma.run.create({
      data: {
        scraperId,
        status: 'PENDING',
        mode: scraper.mode,
      },
    });

    // Fire and forget — relay execution happens async
    this.relayService
      .execute(scraper.config as Record<string, unknown>)
      .then(async (result) => {
        await this.prisma.run.update({
          where: { id: run.id },
          data: {
            status: 'SUCCESS',
            resultText: typeof result === 'string' ? result : JSON.stringify(result),
            completedAt: new Date(),
          },
        });
      })
      .catch(async (error: Error) => {
        await this.prisma.run.update({
          where: { id: run.id },
          data: {
            status: 'FAILED',
            errorMessage: error.message,
            completedAt: new Date(),
          },
        });
      });

    return run;
  }

  async findAll(scraperId: string, userId: string) {
    const scraper = await this.prisma.scraper.findFirst({
      where: { id: scraperId, userId },
    });

    if (!scraper) {
      throw new NotFoundException('Scraper not found');
    }

    return this.prisma.run.findMany({
      where: { scraperId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const run = await this.prisma.run.findFirst({
      where: { id },
      include: { scraper: true },
    });

    if (!run || run.scraper.userId !== userId) {
      throw new NotFoundException('Run not found');
    }

    return run;
  }
}
