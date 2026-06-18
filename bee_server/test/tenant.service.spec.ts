import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { TenantService } from '../src/modules/tenant/tenant.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('TenantService', () => {
  let service: TenantService;
  let prisma: any;

  const mockPrisma = {
    tenant: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    tenantMember: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建企业并设置创建者为 OWNER', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);
      mockPrisma.tenant.create.mockResolvedValue({
        id: 'tenant-1', name: '字节跳动', slug: 'byte_xxx',
        members: [{ userId: 'user-1', role: 'OWNER' }],
      });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.create({
        name: '字节跳动',
        description: 'AI 公司',
        industry: '人工智能',
        ownerId: 'user-1',
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', '字节跳动');
      expect(mockPrisma.tenant.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: '字节跳动',
            members: { create: { userId: 'user-1', role: 'OWNER' } },
          }),
        }),
      );
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' }, data: { role: 'RECRUITER' } }),
      );
    });

    it('重复企业名应该抛出异常', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(
        service.create({ name: '字节跳动', ownerId: 'user-1' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getMyTenant', () => {
    it('应该返回用户所属企业', async () => {
      mockPrisma.tenantMember.findFirst.mockResolvedValue({
        tenant: { id: 'tenant-1', name: '字节跳动' },
      });
      const result = await service.getMyTenant('user-1');
      expect(result).toHaveProperty('name', '字节跳动');
    });

    it('无企业时返回 null', async () => {
      mockPrisma.tenantMember.findFirst.mockResolvedValue(null);
      const result = await service.getMyTenant('user-1');
      expect(result).toBeNull();
    });
  });

  describe('addMember', () => {
    it('应该成功添加成员', async () => {
      mockPrisma.tenantMember.findUnique.mockResolvedValue(null);
      mockPrisma.tenantMember.create.mockResolvedValue({
        tenantId: 'tenant-1', userId: 'user-2', role: 'RECRUITER',
      });
      const result = await service.addMember('tenant-1', 'user-2', 'RECRUITER');
      expect(result).toHaveProperty('role', 'RECRUITER');
    });

    it('重复添加应该抛出异常', async () => {
      mockPrisma.tenantMember.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(
        service.addMember('tenant-1', 'user-2'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('removeMember', () => {
    it('应该成功移除成员', async () => {
      mockPrisma.tenantMember.delete.mockResolvedValue({});
      await service.removeMember('tenant-1', 'user-2');
      expect(mockPrisma.tenantMember.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId_userId: { tenantId: 'tenant-1', userId: 'user-2' } } }),
      );
    });
  });
});
