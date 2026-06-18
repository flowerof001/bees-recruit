import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';

jest.mock('uuid', () => ({ v4: () => 'mock-uuid-12345' }));

import { AuthService } from '../src/modules/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { RedisService } from '../src/common/cache/redis.service';
import { SmsService } from '../src/modules/sms/sms.service';
import { AuditService } from '../src/modules/audit/audit.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: JwtService;
  let sms: any;
  let audit: any;

  const mockPrisma = {
    user: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    admin: { findUnique: jest.fn() },
    deviceSession: { findMany: jest.fn(), deleteMany: jest.fn(), upsert: jest.fn() },
    passwordReset: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  };

  const mockRedis = {
    set: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(undefined),
    sadd: jest.fn().mockResolvedValue(undefined),
    sismember: jest.fn().mockResolvedValue(false),
    incr: jest.fn().mockResolvedValue(1),
  };

  const mockSms = {
    sendCode: jest.fn().mockResolvedValue({ success: true }),
    verifyCode: jest.fn().mockResolvedValue(true),
    canSend: jest.fn().mockResolvedValue(true),
    sendNotification: jest.fn().mockResolvedValue(true),
  };

  const mockAudit = {
    log: jest.fn().mockResolvedValue(undefined),
    logBatch: jest.fn().mockResolvedValue(undefined),
    logLogin: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    getLoginLogs: jest.fn().mockResolvedValue({ items: [], total: 0 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: SmsService, useValue: mockSms },
        { provide: AuditService, useValue: mockAudit },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('mock.jwt.token'), decode: jest.fn().mockReturnValue({ sub: 'user-1', exp: 9999999999 }), verify: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('test-secret') } },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    sms = module.get(SmsService);
    audit = module.get(AuditService);
    jest.clearAllMocks();
  });

  // ====== 手机号登录 ======
  describe('loginByPhone', () => {
    it('新用户自动注册', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'u1', phone: '13800138000', role: 'JOB_SEEKER', status: 'ACTIVE' });
      const result = await service.loginByPhone('13800138000', '123456');
      expect(result).toHaveProperty('accessToken');
      expect(mockAudit.logLogin).toHaveBeenCalled();
    });

    it('被封禁用户拒绝登录', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', status: 'BANNED' });
      await expect(service.loginByPhone('13800138000', '123456')).rejects.toThrow(UnauthorizedException);
    });
  });

  // ====== 密码登录 ======
  describe('loginByPassword', () => {
    it('正确密码登录成功', async () => {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('mypass', 10);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', phone: '13800138000', passwordHash: hash, role: 'JOB_SEEKER', status: 'ACTIVE',
      });
      const result = await service.loginByPassword('13800138000', 'mypass');
      expect(result).toHaveProperty('accessToken');
      expect(mockAudit.logLogin).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('错误密码被拒绝', async () => {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('mypass', 10);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', passwordHash: hash, status: 'ACTIVE',
      });
      await expect(service.loginByPassword('13800138000', 'wrong')).rejects.toThrow(UnauthorizedException);
      expect(mockAudit.logLogin).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('未设置密码的用户被提示', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'u1', passwordHash: null, status: 'ACTIVE' });
      await expect(service.loginByPassword('13800138000', 'any')).rejects.toThrow('未设置密码');
    });
  });

  // ====== 密码管理 ======
  describe('setPassword', () => {
    it('成功设置密码', async () => {
      mockPrisma.user.update.mockResolvedValue({});
      await service.setPassword('u1', 'newpass123');
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it('密码太短被拒绝', async () => {
      await expect(service.setPassword('u1', '12345')).rejects.toThrow(BadRequestException);
    });
  });

  // ====== 密码重置 ======
  describe('requestPasswordReset', () => {
    it('存在的手机号发起重置', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', phone: '13800138000' });
      mockPrisma.passwordReset.create.mockResolvedValue({});
      const result = await service.requestPasswordReset('13800138000', 'PHONE');
      expect(result).toHaveProperty('message');
    });

    it('不存在的手机号不泄露信息', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await service.requestPasswordReset('13800000000', 'PHONE');
      expect(result.message).toContain('如果账号存在');
    });
  });

  // ====== 设备管理 ======
  describe('getDevices', () => {
    it('返回活跃设备列表', async () => {
      mockPrisma.deviceSession.findMany.mockResolvedValue([
        { deviceId: 'd1', deviceName: 'iPhone 15', lastActiveAt: new Date() },
      ]);
      const result = await service.getDevices('u1');
      expect(result).toHaveLength(1);
    });
  });

  describe('revokeDevice', () => {
    it('成功踢出设备', async () => {
      mockPrisma.deviceSession.deleteMany.mockResolvedValue({});
      await service.revokeDevice('u1', 'd1');
      expect(mockRedis.del).toHaveBeenCalledWith('refresh:d1');
    });
  });

  // ====== 管理员登录 ======
  describe('adminLogin', () => {
    it('正确凭据返回 Token', async () => {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('admin123', 10);
      mockPrisma.admin.findUnique.mockResolvedValue({ id: 'a1', username: 'admin', passwordHash: hash, role: 'SUPER_ADMIN' });
      const result = await service.adminLogin('admin', 'admin123');
      expect(result).toHaveProperty('accessToken');
    });
  });
});
