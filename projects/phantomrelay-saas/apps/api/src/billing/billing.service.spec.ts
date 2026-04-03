import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

const mockPrisma = {
  plan: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  user: {
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    findFirst: jest.fn(),
  },
  usageRecord: {
    findUnique: jest.fn(),
  },
  notification: {
    create: jest.fn(),
  },
};

const mockConfig = {
  get: jest.fn((key: string, defaultValue?: string) => {
    const values: Record<string, string> = {
      FRONTEND_URL: 'http://localhost:4321',
      STRIPE_WEBHOOK_SECRET: '',
      // No STRIPE_SECRET_KEY — forces mock mode
    };
    return values[key] ?? defaultValue ?? undefined;
  }),
};

describe('BillingService', () => {
  let service: BillingService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
  });

  describe('getPlans', () => {
    it('should return all plans ordered by price', async () => {
      const plans = [
        { id: '1', name: 'free', price: 0 },
        { id: '2', name: 'pro', price: 2900 },
        { id: '3', name: 'enterprise', price: 9900 },
      ];
      mockPrisma.plan.findMany.mockResolvedValue(plans);

      const result = await service.getPlans();

      expect(result).toEqual(plans);
      expect(mockPrisma.plan.findMany).toHaveBeenCalledWith({ orderBy: { price: 'asc' } });
    });
  });

  describe('getCurrentUsage', () => {
    it('should return usage with percentage', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'user-1',
        plan: { name: 'pro', requestsPerMonth: 1000 },
      });
      mockPrisma.usageRecord.findUnique.mockResolvedValue({ requests: 250 });

      const result = await service.getCurrentUsage('user-1');

      expect(result).toEqual(
        expect.objectContaining({
          used: 250,
          limit: 1000,
          percentage: 25,
          plan: 'pro',
        }),
      );
      expect(result).toHaveProperty('period');
    });

    it('should return 0 usage when no record exists', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'user-1',
        plan: { name: 'free', requestsPerMonth: 100 },
      });
      mockPrisma.usageRecord.findUnique.mockResolvedValue(null);

      const result = await service.getCurrentUsage('user-1');

      expect(result.used).toBe(0);
      expect(result.percentage).toBe(0);
    });
  });

  describe('createCheckoutSession', () => {
    it('should return mock URL when Stripe is not configured', async () => {
      mockPrisma.plan.findUnique.mockResolvedValue({ id: 'plan-pro', name: 'pro', price: 2900 });

      const result = await service.createCheckoutSession('user-1', 'pro');

      expect(result).toEqual({ url: 'https://checkout.stripe.com/mock-session' });
    });

    it('should throw when plan not found', async () => {
      mockPrisma.plan.findUnique.mockResolvedValue(null);

      await expect(
        service.createCheckoutSession('user-1', 'nonexistent'),
      ).rejects.toThrow('Plan "nonexistent" not found');
    });
  });

  describe('handleWebhook', () => {
    it('should return received:true when Stripe not configured (mock mode)', async () => {
      const result = await service.handleWebhook(Buffer.from('{}'), 'sig');

      expect(result).toEqual({ received: true });
    });
  });
});
