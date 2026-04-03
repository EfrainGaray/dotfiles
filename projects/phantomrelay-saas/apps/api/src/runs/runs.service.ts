import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RelayService, RelayError } from '../relay/relay.service';

@Injectable()
export class RunsService {
  private readonly logger = new Logger(RunsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly relayService: RelayService,
  ) {}

  /**
   * Create and execute a run for a scraper.
   * Returns the run immediately (fire-and-forget), executes in background.
   */
  async create(scraperId: string, userId: string) {
    const scraper = await this.prisma.scraper.findFirst({
      where: { id: scraperId, userId },
    });

    if (!scraper) {
      throw new NotFoundException('Scraper not found');
    }

    // Check usage limits
    await this.checkUsageLimits(userId);

    // Create run as PENDING
    const run = await this.prisma.run.create({
      data: {
        scraperId,
        status: 'PENDING',
        mode: scraper.mode,
      },
    });

    // Fire-and-forget: execute in background
    this.executeInBackground(run.id, scraper).catch((err) => {
      this.logger.error(`Unhandled error in background run ${run.id}: ${err.message}`);
    });

    return run;
  }

  /**
   * Background execution: calls engine, updates run record, tracks usage.
   */
  private async executeInBackground(
    runId: string,
    scraper: { id: string; url: string; mode: string; config: unknown },
  ) {
    // Mark as RUNNING
    await this.prisma.run.update({
      where: { id: runId },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    try {
      const result = await this.relayService.execute(
        scraper.url,
        scraper.mode,
        (scraper.config as Record<string, unknown>) ?? {},
      );

      // Determine status from engine response
      const isSuccess = result.status === 'success';
      const runStatus = isSuccess ? 'SUCCESS' : result.status === 'timeout' ? 'TIMEOUT' : 'FAILED';

      await this.prisma.run.update({
        where: { id: runId },
        data: {
          status: runStatus,
          latencyMs: result.latencyMs,
          resultHtml: result.html ?? null,
          resultText: result.text ?? null,
          screenshotUrl: result.screenshot ?? null,
          harData: result.har ? (result.har as object) : undefined,
          detectionSignals: result.detectionSignals ? (result.detectionSignals as object[]) : undefined,
          errorCode: result.error?.code ?? null,
          errorMessage: result.error?.message ?? null,
          completedAt: new Date(),
        },
      });

      // Update scraper lastRunAt
      await this.prisma.scraper.update({
        where: { id: scraper.id },
        data: { lastRunAt: new Date() },
      });

      // Increment usage
      await this.incrementUsage(runId);

      this.logger.log(`Run ${runId} completed: ${runStatus}`);
    } catch (err) {
      const error = err instanceof RelayError ? err : new RelayError('UNKNOWN', (err as Error).message);

      await this.prisma.run.update({
        where: { id: runId },
        data: {
          status: 'FAILED',
          errorCode: error.code,
          errorMessage: error.message,
          completedAt: new Date(),
        },
      });

      // Update scraper lastRunAt even on failure
      await this.prisma.scraper.update({
        where: { id: scraper.id },
        data: { lastRunAt: new Date() },
      });

      // Still count failed runs toward usage
      await this.incrementUsage(runId);

      this.logger.error(`Run ${runId} failed: [${error.code}] ${error.message}`);
    }
  }

  /**
   * Check if the user has remaining requests in their plan for this month.
   */
  private async checkUsageLimits(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const period = this.getCurrentPeriod();
    const usage = await this.prisma.usageRecord.findUnique({
      where: { userId_period: { userId, period } },
    });

    const currentRequests = usage?.requests ?? 0;
    if (currentRequests >= user.plan.requestsPerMonth) {
      throw new ForbiddenException(
        `Monthly request limit reached (${user.plan.requestsPerMonth}). Upgrade your plan.`,
      );
    }
  }

  /**
   * Increment the UsageRecord for the current month after a run completes.
   */
  private async incrementUsage(runId: string) {
    const run = await this.prisma.run.findUnique({
      where: { id: runId },
      include: { scraper: true },
    });
    if (!run) return;

    const period = this.getCurrentPeriod();
    await this.prisma.usageRecord.upsert({
      where: { userId_period: { userId: run.scraper.userId, period } },
      create: {
        userId: run.scraper.userId,
        period,
        requests: 1,
      },
      update: {
        requests: { increment: 1 },
      },
    });
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * List runs for a user, optionally filtered by scraperId and status.
   */
  async findAll(
    userId: string,
    options: {
      scraperId?: string;
      status?: string;
      take?: number;
      skip?: number;
    } = {},
  ) {
    const { scraperId, status, take = 20, skip = 0 } = options;

    // Build where clause — ensure user ownership via scraper relation
    const where: Record<string, unknown> = {
      scraper: { userId },
    };
    if (scraperId) where.scraperId = scraperId;
    if (status) where.status = status;

    const [runs, total] = await Promise.all([
      this.prisma.run.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: {
          scraper: { select: { id: true, name: true, url: true } },
        },
      }),
      this.prisma.run.count({ where }),
    ]);

    return { runs, total, take, skip };
  }

  /**
   * Get full run detail including all result fields.
   */
  async findOne(id: string, userId: string) {
    const run = await this.prisma.run.findFirst({
      where: { id },
      include: {
        scraper: { select: { id: true, name: true, url: true, userId: true } },
      },
    });

    if (!run || run.scraper.userId !== userId) {
      throw new NotFoundException('Run not found');
    }

    return run;
  }

  /**
   * Get aggregate statistics for a user's runs.
   */
  async getStats(userId: string) {
    const where = { scraper: { userId } };

    const [total, successCount, failedCount, runs] = await Promise.all([
      this.prisma.run.count({ where }),
      this.prisma.run.count({ where: { ...where, status: 'SUCCESS' } }),
      this.prisma.run.count({ where: { ...where, status: 'FAILED' } }),
      this.prisma.run.findMany({
        where: { ...where, status: 'SUCCESS', latencyMs: { not: null } },
        select: { latencyMs: true },
      }),
    ]);

    const avgLatency =
      runs.length > 0
        ? Math.round(runs.reduce((sum, r) => sum + (r.latencyMs ?? 0), 0) / runs.length)
        : 0;

    // Runs today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const runsToday = await this.prisma.run.count({
      where: { ...where, createdAt: { gte: todayStart } },
    });

    // Current month usage
    const period = this.getCurrentPeriod();
    const usage = await this.prisma.usageRecord.findFirst({
      where: { user: { id: userId }, period },
    });

    return {
      total,
      successCount,
      failedCount,
      successRate: total > 0 ? Math.round((successCount / total) * 100) : 0,
      avgLatencyMs: avgLatency,
      runsToday,
      monthlyUsage: usage?.requests ?? 0,
    };
  }
}
