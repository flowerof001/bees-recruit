import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { ApplicationService } from '../src/modules/job/application.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotificationService } from '../src/modules/notification/notification.service';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let prisma: any;

  const mockPrisma = {
    job: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    resume: {
      findFirst: jest.fn(),
    },
    application: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockNotification = {
    create: jest.fn(),
    batchCreate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationService, useValue: mockNotification },
      ],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('apply', () => {
    it('应该成功投递简历', async () => {
      mockPrisma.job.findUnique.mockResolvedValue({ id: 'job-1', title: 'Flutter 开发', status: 'OPEN', publisherId: 'pub-1' });
      mockPrisma.resume.findFirst.mockResolvedValue({ id: 'resume-1', name: '张三', userId: 'user-1' });
      mockPrisma.application.findUnique.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue({
        id: 'app-1', jobId: 'job-1', userId: 'user-1', resumeId: 'resume-1', status: 'PENDING',
      });

      const result = await service.apply('user-1', 'job-1', 'resume-1', '期待加入');
      expect(result).toHaveProperty('status', 'PENDING');
      expect(mockNotification.create).toHaveBeenCalled();
    });

    it('重复投递应该抛出异常', async () => {
      mockPrisma.job.findUnique.mockResolvedValue({ id: 'job-1', status: 'OPEN' });
      mockPrisma.resume.findFirst.mockResolvedValue({ id: 'resume-1', userId: 'user-1' });
      mockPrisma.application.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(service.apply('user-1', 'job-1', 'resume-1')).rejects.toThrow(ConflictException);
    });

    it('已关闭的岗位不能投递', async () => {
      mockPrisma.job.findUnique.mockResolvedValue({ id: 'job-1', status: 'CLOSED' });
      await expect(service.apply('user-1', 'job-1', 'resume-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('招聘方应该能更新状态', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1', userId: 'user-1', job: { tenantId: 'tenant-1', title: 'Flutter 开发' },
      });
      mockPrisma.application.update.mockResolvedValue({ id: 'app-1', status: 'ACCEPTED' });

      const result = await service.updateStatus('app-1', 'tenant-1', 'ACCEPTED', 'operator-1');
      expect(result).toHaveProperty('status', 'ACCEPTED');
      expect(mockNotification.create).toHaveBeenCalled();
    });

    it('无权操作应抛出异常', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1', job: { tenantId: 'tenant-1' },
      });
      await expect(service.updateStatus('app-1', 'wrong-tenant', 'ACCEPTED', 'op-1')).rejects.toThrow(ForbiddenException);
    });
  });
});
