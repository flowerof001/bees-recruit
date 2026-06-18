import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/cache/redis.service';
import { SmsService } from '../sms/sms.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
    private smsService: SmsService,
    private auditService: AuditService,
  ) {}

  // ============ 验证码 ============

  async sendSmsCode(phone: string): Promise<void> {
    const canSend = await this.smsService.canSend(phone);
    if (!canSend) throw new BadRequestException('发送过于频繁，请稍后再试');
    await this.smsService.sendCode(phone);
  }

  // ============ 手机号登录/注册 ============

  async loginByPhone(
    phone: string, code: string,
    meta?: { ip?: string; userAgent?: string; device?: string },
  ) {
    const valid = await this.smsService.verifyCode(phone, code);
    if (!valid) throw new UnauthorizedException('验证码错误或已过期');

    let user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { phone, nickname: `用户${phone.slice(-4)}`, role: 'JOB_SEEKER' },
      });
    }

    if (user.status === 'BANNED') throw new UnauthorizedException('账号已被禁用');

    await this.auditService.logLogin({
      userId: user.id, method: 'PHONE', ip: meta?.ip,
      userAgent: meta?.userAgent, device: meta?.device, success: true,
    });

    return this.issueTokens(user, meta?.device);
  }

  async registerByPhone(dto: {
    phone: string; code: string; role: string;
    nickname?: string; password?: string;
  }) {
    const valid = await this.smsService.verifyCode(dto.phone, dto.code);
    if (!valid) throw new UnauthorizedException('验证码错误');

    const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing) throw new ConflictException('该手机号已注册');

    const data: any = {
      phone: dto.phone,
      nickname: dto.nickname ?? `用户${dto.phone.slice(-4)}`,
      role: dto.role as any,
    };
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.prisma.user.create({ data });
    await this.auditService.log({
      userId: user.id, action: 'CREATE', resource: 'USER',
      resourceId: user.id, detail: { method: 'PHONE' },
    });

    return this.issueTokens(user);
  }

  // ============ 密码登录 ============

  async loginByPassword(
    login: string, // 手机号或邮箱
    password: string,
    meta?: { ip?: string; userAgent?: string; device?: string },
  ) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ phone: login }, { email: login }] },
    });

    if (!user) throw new UnauthorizedException('账号不存在');
    if (user.status === 'BANNED') throw new UnauthorizedException('账号已被禁用');
    if (!user.passwordHash) throw new UnauthorizedException('该账号未设置密码，请使用验证码登录');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await this.auditService.logLogin({
        userId: user.id, method: 'PASSWORD', ip: meta?.ip,
        userAgent: meta?.userAgent, device: meta?.device,
        success: false, failReason: '密码错误',
      });
      throw new UnauthorizedException('密码错误');
    }

    await this.auditService.logLogin({
      userId: user.id, method: 'PASSWORD', ip: meta?.ip,
      userAgent: meta?.userAgent, device: meta?.device, success: true,
    });

    return this.issueTokens(user, meta?.device);
  }

  // ============ 设置/修改密码 ============

  async setPassword(userId: string, newPassword: string) {
    if (newPassword.length < 6) throw new BadRequestException('密码至少 6 位');
    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
    await this.auditService.log({
      userId, action: 'UPDATE', resource: 'USER',
      resourceId: userId, detail: { field: 'password' },
    });
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) throw new BadRequestException('未设置密码');
    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('原密码错误');
    return this.setPassword(userId, newPassword);
  }

  // ============ 密码重置 ============

  async requestPasswordReset(target: string, method: 'PHONE' | 'EMAIL') {
    const user = method === 'PHONE'
      ? await this.prisma.user.findUnique({ where: { phone: target } })
      : await this.prisma.user.findUnique({ where: { email: target } });

    if (!user) return { message: '如果账号存在，重置链接已发送' }; // 防止用户枚举

    const token = uuid();
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id, token, method,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30分钟
      },
    });

    if (method === 'PHONE') {
      await this.smsService.sendNotification(target, 'PASSWORD_RESET', { token });
    } else {
      // TODO: 发送重置邮件
      this.logger.log(`密码重置 Token → ${target}: ${token}`);
    }

    return { message: '重置链接已发送' };
  }

  async resetPassword(token: string, newPassword: string) {
    const reset = await this.prisma.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.used || new Date() > reset.expiresAt) {
      throw new BadRequestException('重置链接无效或已过期');
    }

    await this.setPassword(reset.userId, newPassword);
    await this.prisma.passwordReset.update({ where: { token }, data: { used: true } });
    return { message: '密码重置成功' };
  }

  // ============ 微信登录 ============

  async loginByWechat(
    code: string,
    meta?: { ip?: string; userAgent?: string; device?: string },
  ) {
    // TODO: 对接微信 OAuth API
    // const wechatRes = await this.wechatOAuth(code);
    const mockOpenId = `wx_${code.slice(0, 10)}_${uuid().slice(0, 6)}`;

    let user = await this.prisma.user.findUnique({ where: { wechatOpenId: mockOpenId as any } });
    if (!user) {
      // TODO: 通过 access_token 获取用户信息
      user = await this.prisma.user.create({
        data: {
          wechatOpenId: mockOpenId,
          nickname: `微信用户${uuid().slice(0, 4)}`,
          role: 'JOB_SEEKER',
        },
      });
    }

    if (user.status === 'BANNED') throw new UnauthorizedException('账号已被禁用');

    await this.auditService.logLogin({
      userId: user.id, method: 'WECHAT', ip: meta?.ip,
      userAgent: meta?.userAgent, device: meta?.device, success: true,
    });

    return this.issueTokens(user, meta?.device);
  }

  /** 微信绑定手机号 */
  async bindWechatPhone(userId: string, wechatPhoneCode: string) {
    // TODO: 换取微信绑定的手机号
    const mockPhone = wechatPhoneCode.startsWith('mock_') ? wechatPhoneCode.replace('mock_', '') : null;
    if (!mockPhone) throw new BadRequestException('获取手机号失败');

    const existing = await this.prisma.user.findUnique({ where: { phone: mockPhone } });
    if (existing && existing.id !== userId) {
      throw new ConflictException('该手机号已被其他账号绑定');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { phone: mockPhone },
    });
  }

  // ============ 绑定邮箱 ============

  async bindEmail(userId: string, email: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('该邮箱已被绑定');
    await this.prisma.user.update({ where: { id: userId }, data: { email } });
    await this.auditService.log({
      userId, action: 'UPDATE', resource: 'USER',
      resourceId: userId, detail: { field: 'email', value: email },
    });
  }

  // ============ 设备管理 ============

  async getDevices(userId: string) {
    return this.prisma.deviceSession.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { lastActiveAt: 'desc' },
    });
  }

  async revokeDevice(userId: string, deviceId: string) {
    await this.prisma.deviceSession.deleteMany({
      where: { userId, deviceId },
    });
    // 清除 Redis 中的 refresh token
    await this.redisService.del(`refresh:${deviceId}`);
  }

  async revokeAllDevices(userId: string) {
    const devices = await this.prisma.deviceSession.findMany({
      where: { userId }, select: { deviceId: true },
    });
    for (const d of devices) {
      await this.redisService.del(`refresh:${d.deviceId}`);
    }
    await this.prisma.deviceSession.deleteMany({ where: { userId } });
  }

  // ============ 管理员 ============

  async adminLogin(
    username: string, password: string,
    meta?: { ip?: string; userAgent?: string },
  ) {
    const admin = await this.prisma.admin.findUnique({ where: { username } });
    if (!admin) throw new UnauthorizedException('管理员不存在');
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      await this.auditService.log({
        userId: admin.id, action: 'LOGIN_FAILED', resource: 'ADMIN',
        detail: { reason: '密码错误' }, ip: meta?.ip,
      });
      throw new UnauthorizedException('密码错误');
    }

    await this.auditService.logLogin({
      userId: admin.id, method: 'ADMIN', ip: meta?.ip,
      userAgent: meta?.userAgent, success: true,
    });

    const payload = { sub: admin.id, username: admin.username, role: 'ADMIN', adminRole: admin.role };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '12h' }),
      user: admin,
    };
  }

  // ============ 登录日志 ============

  async getLoginLogs(userId: string, query: any) {
    return this.auditService.getLoginLogs(userId, query);
  }

  // ============ 登出 & 刷新 ============

  async logout(token: string) {
    try {
      const decoded = this.jwtService.decode(token) as any;
      if (decoded?.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await this.redisService.sadd('jwt:blacklist', token);
          // 让集合在最后一个 token 过期后自动清理
          await this.redisService.set(`blacklist:ttl:${token}`, '1', ttl);
        }
      }
    } catch {}
    await this.auditService.log({
      userId: (this.jwtService.decode(token) as any)?.sub,
      action: 'LOGOUT', resource: 'USER',
    });
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.redisService.sismember('jwt:blacklist', token);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken) as any;
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.status === 'BANNED') throw new UnauthorizedException();
      return this.issueTokens(user);
    } catch {
      throw new UnauthorizedException('Token 无效或已过期');
    }
  }

  // ============ 私有方法 ============

  private async issueTokens(user: any, device?: string) {
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    // 管理设备会话
    if (device) {
      const deviceId = uuid();
      await this.redisService.set(`refresh:${deviceId}`, refreshToken, 30 * 86400);
      await this.prisma.deviceSession.upsert({
        where: { deviceId },
        create: {
          userId: user.id, deviceId, deviceName: device,
          refreshToken, expiresAt: new Date(Date.now() + 30 * 86400000),
        },
        update: {
          refreshToken, lastActiveAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 86400000),
        },
      });
    }

    const safeUser = {
      id: user.id, phone: user.phone, email: user.email,
      nickname: user.nickname, avatar: user.avatar, role: user.role,
    };

    return { accessToken, refreshToken, user: safeUser };
  }
}
