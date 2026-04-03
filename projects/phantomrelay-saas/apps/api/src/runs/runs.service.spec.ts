import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { RunsService } from './runs.service';
import { PrismaService } from '../prisma/prisma.service';
import { RelayService } from '../relay/relay.service';
import { NotificationsService } from '../notifications/notifications.service';

const mockPrisma = {
  scraper: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  run: {
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  usageRecord: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    upsert: jest.fn(),
  },
};

const mockRelay = {
  execute: jest.fn(),
};

const mockNotifications = {
  create: jest.fn().mockResolvedValue(undefined),
  deliverWebhook: jest.fn().mockResolvedValue(undefined),
};

describe('RunsService', () => {
  let service: RunsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RunsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RelayService, useValue: mockRelay },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();

    service = module.get<RunsService>(RunsService);
  });

  describe('create', () => {
    it('should create a PENDING run and return it', async () => {
      const scraper = {
        id: 'scraper-1',
        userId: 'user-1',
        name: 'Test Scraper',
        url: 'https://example.com',
        mode: 'headless',
        config: {},
      };
      mockPrisma.scraper.findFirst.mockResolvedValue(scraper);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        plan: { requestsPerMonth: 100 },
      });
      mockPrisma.usageRecord.findUnique.mockResolvedValue(null);
      mockPrisma.run.create.mockResolvedValue({
        id: 'run-1',
        scraperId: 'scraper-1',
        status: 'PENDING',
        mode: 'headless',
      });
      // Mock background execution dependencies
      mockPrisma.run.update.mockResolvedValue({});
      mockRelay.execute.mockResolvedValue({ status: 'success', latencyMs: 100, html: '<html/>' });
      mockPrisma.run.findUnique.mockResolvedValue({ id: 'run-1', scraper: { userId: 'user-1' } });
      mockPrisma.usageRecord.upsert.mockResolvedValue({});
      mockPrisma.scraper.update.mockResolvedValue({});

      const result = await service.create('scraper-1', 'user-1');

      expect(result).toEqual(
        expect.objectContaining({
          id: 'run-1',
          status: 'PENDING',
        }),
      );
      expect(mockPrisma.run.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            scraperId: 'scraper-1',
            status: 'PENDING',
          }),
        }),
      );
    });

    it('should reject when usage limit exceeded', async () => {
      mockPrisma.scraper.findFirst.mockResolvedValue({
        id: 'scraper-1',
        userId: 'user-1',
        mode: 'headless',
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        plan: { requestsPerMonth: 100 },
      });
      mockPrisma.usageRecord.findUnique.mockResolvedValue({ requests: 100 });

      await expect(service.create('scraper-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return paginated runs', async () => {
      const runs = [
        { id: 'run-1', status: 'SUCCESS' },
        { id: 'run-2', status: 'FAILED' },
      ];
      mockPrisma.run.findMany.mockResolvedValue(runs);
      mockPrisma.run.count.mockResolvedValue(2);

      const result = await service.findAll('user-1', { take: 10, skip: 0 });

      expect(result).toEqual({ runs, total: 2, take: 10, skip: 0 });
      expect(mockPrisma.run.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            scraper: { userId: 'user-1' },
          }),
          take: 10,
          skip: 0,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for wrong user', async () => {
      mockPrisma.run.findFirst.mockResolvedValue({
        id: 'run-1',
        scraper: { id: 'scraper-1', userId: 'other-user' },
      });

      await expect(service.findOne('run-1', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should return run for correct user', async () => {
      const run = {
        id: 'run-1',
        status: 'SUCCESS',
        scraper: { id: 'scraper-1', name: 'Test', url: 'https://example.com', userId: 'user-1' },
      };
      mockPrisma.run.findFirst.mockResolvedValue(run);

      const result = await service.findOne('run-1', 'user-1');
      expect(result).toEqual(run);
    });
  });

  describe('getStats', () => {
    it('should return correct aggregates', async () => {
      mockPrisma.run.count
        .mockResolvedValueOnce(50)   // total
        .mockResolvedValueOnce(40)   // success
        .mockResolvedValueOnce(8)    // failed
        .mockResolvedValueOnce(5);   // runsToday
      mockPrisma.run.findMany.mockResolvedValue([
        { latencyMs: 100 },
        { latencyMs: 200 },
        { latencyMs: 300 },
      ]);
      mockPrisma.usageRecord.findFirst.mockResolvedValue({ requests: 45 });

      const result = await service.getStats('user-1');

      expect(result).toEqual({
        total: 50,
        successCount: 40,
        failedCount: 8,
        successRate: 80,
        avgLatencyMs: 200,
        runsToday: 5,
        monthlyUsage: 45,
      });
    });
  });
});
