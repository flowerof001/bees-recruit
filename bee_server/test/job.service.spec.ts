import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { JobService } from '../src/modules/job/job.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { SubscriptionService } from '../src/modules/subscription/subscription.service';
import { NotificationService } from '../src/modules/notification/notification.service';

describe('JobService', () => {
  let service: JobService;
  let prisma: any;
  let subscription: any;

  const mockPrisma = {
    job: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    subscription: {
      updateMany: jest.fn(),
    },
  };

  const mockSubscription = {
    canPostJob: jest.fn(),
  };

  const mockNotification = {
    create: jest.fn(),
    batchCreate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SubscriptionService, useValue: mockSubscription },
        { provide: NotificationService, useValue: mockNotification },
      ],
    }).compile();

    service = module.get<JobService>(JobService);
    prisma = module.get(PrismaService);
    subscription = module.get(SubscriptionService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const jobDto = {
      title: '高级 Flutter 工程师',
      description: '负责跨平台应用开发',
      tags: ['Flutter', 'Dart'],
      location: '北京',
    };

    it('应该成功创建岗位', async () => {
      mockSubscription.canPostJob.mockResolvedValue(true);
      mockPrisma.job.create.mockResolvedValue({
        id: 'job-1', ...jobDto, tenantId: 'tenant-1', publisherId: 'user-1', status: 'OPEN',
      });
      mockPrisma.subscription.updateMany.mockResolvedValue({});

      const result = await service.create('tenant-1', 'user-1', jobDto);
      expect(result).toHaveProperty('id', 'job-1');
      expect(result).toHaveProperty('title', '高级 Flutter 工程师');
      expect(mockPrisma.subscription.updateMany).toHaveBeenCalled();
    });

    it('超过岗位配额应该抛出异常', async () => {
      mockSubscription.canPostJob.mockRejectedValue(new ForbiddenException('已达到最大岗位数'));
      await expect(service.create('tenant-1', 'user-1', jobDto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('search', () => {
    it('应该返回分页结果', async () => {
      mockPrisma.job.findMany.mockResolvedValue([
        { id: 'job-1', title: 'Flutter 开发', status: 'OPEN', tags: ['Flutter'] },
      ]);
      mockPrisma.job.count.mockResolvedValue(1);

      const result = await service.search({ keyword: 'Flutter', page: 1, pageSize: 20 });
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('total', 1);
      expect(result.items).toHaveLength(1);
    });

    it('空搜索应该返回所有开放岗位', async () => {
      mockPrisma.job.findMany.mockResolvedValue([]);
      mockPrisma.job.count.mockResolvedValue(0);

      const result = await service.search({});
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getById', () => {
    it('应该返回岗位详情', async () => {
      mockPrisma.job.findUnique.mockResolvedValue({
        id: 'job-1', title: 'Flutter 开发', status: 'OPEN', tenant: {}, publisher: {},
      });
      mockPrisma.job.update.mockResolvedValue({});

      const result = await service.getById('job-1');
      expect(result).toHaveProperty('title', 'Flutter 开发');
      expect(mockPrisma.job.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { viewCount: { increment: 1 } } }),
      );
    });

    it('不存在的岗位应该抛出异常', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(null);
      await expect(service.getById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('close', () => {
    it('应该成功关闭岗位', async () => {
      mockPrisma.job.updateMany.mockResolvedValue({ count: 1 });
      const result = await service.close('job-1', 'tenant-1');
      expect(result).toEqual({ success: true });
    });

    it('无权关闭应抛出异常', async () => {
      mockPrisma.job.updateMany.mockResolvedValue({ count: 0 });
      await expect(service.close('job-1', 'wrong-tenant')).rejects.toThrow(NotFoundException);
    });
  });
});
