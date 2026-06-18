import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { SubscriptionService } from '../src/modules/subscription/subscription.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotificationService } from '../src/modules/notification/notification.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let prisma: any;

  const freePlan = {
    id: 'FREE', name: 'FREE', nameCN: '免费版',
    priceMonthly: 0, priceYearly: 0, maxJobs: 3, maxRecruiters: 1, maxChatsPerDay: 10,
    features: [], recommended: false, isActive: true,
  };

  const proPlan = {
    id: 'PRO', name: 'PRO', nameCN: '专业版',
    priceMonthly: 29900, priceYearly: 299000, maxJobs: 20, maxRecruiters: 5, maxChatsPerDay: 100,
    features: [], recommended: true, isActive: true,
  };

  const mockPrisma = {
    subscriptionPlan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      createMany: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
    },
    tenantMember: {
      findMany: jest.fn(),
    },
  };

  const mockNotification = {
    create: jest.fn(),
    batchCreate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationService, useValue: mockNotification },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('getPlans', () => {
    it('应该返回所有活跃套餐', async () => {
      mockPrisma.subscriptionPlan.findMany.mockResolvedValue([freePlan, proPlan]);
      const result = await service.getPlans();
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('name', 'FREE');
    });
  });

  describe('subscribe', () => {
    it('免费套餐应该直接激活', async () => {
      mockPrisma.subscriptionPlan.findUnique.mockResolvedValue(freePlan);
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: 'tenant-1', name: '测试企业' });
      mockPrisma.subscription.findFirst.mockResolvedValue(null);
      mockPrisma.subscription.create.mockResolvedValue({
        id: 'sub-1', status: 'ACTIVE', plan: freePlan,
      });

      const result = await service.subscribe('tenant-1', 'FREE');
      expect(result).toHaveProperty('status', 'ACTIVE');
      expect(result).toHaveProperty('plan');
    });

    it('付费套餐应该进入试用期', async () => {
      mockPrisma.subscriptionPlan.findUnique.mockResolvedValue(proPlan);
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: 'tenant-1', name: '测试企业' });
      mockPrisma.subscription.findFirst.mockResolvedValue(null);
      mockPrisma.subscription.create.mockResolvedValue({
        id: 'sub-2', status: 'TRIAL', plan: proPlan,
      });

      const result = await service.subscribe('tenant-1', 'PRO');
      expect(result).toHaveProperty('status', 'TRIAL');
    });

    it('不存在的套餐应该抛出异常', async () => {
      mockPrisma.subscriptionPlan.findUnique.mockResolvedValue(null);
      await expect(service.subscribe('tenant-1', 'INVALID')).rejects.toThrow(NotFoundException);
    });
  });

  describe('canPostJob', () => {
    it('配额充足应该返回 true', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue({
        jobPostsUsed: 1, plan: freePlan, status: 'ACTIVE',
      });
      const result = await service.canPostJob('tenant-1');
      expect(result).toBe(true);
    });

    it('配额用完应该抛出异常', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue({
        jobPostsUsed: 3, plan: freePlan, status: 'ACTIVE',
      });
      await expect(service.canPostJob('tenant-1')).rejects.toThrow(ForbiddenException);
    });

    it('无订阅应该返回 false', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue(null);
      const result = await service.canPostJob('tenant-1');
      expect(result).toBe(false);
    });
  });

  describe('checkExpiredSubscriptions', () => {
    it('应该标记过期订阅', async () => {
      mockPrisma.subscription.updateMany.mockResolvedValue({ count: 3 });
      const count = await service.checkExpiredSubscriptions();
      expect(count).toBe(3);
    });
  });
});
