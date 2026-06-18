import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private smsService: SmsService,
    private auditService: AuditService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, phone: true, email: true,
        nickname: true, avatar: true, role: true, status: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  async updateProfile(userId: string, data: { nickname?: string; avatar?: string; email?: string }) {
    const user = await this.prisma.user.update({ where: { id: userId }, data });

    await this.auditService.log({
      userId, action: 'UPDATE', resource: 'USER',
      resourceId: userId, detail: data,
    });

    return user;
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nickname: true, avatar: true, role: true },
    });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  /** 绑定手机号 */
  async bindPhone(userId: string, phone: string, code: string) {
    const valid = await this.smsService.verifyCode(phone, code);
    if (!valid) throw new BadRequestException('验证码错误');

    const existing = await this.prisma.user.findUnique({ where: { phone } });
    if (existing && existing.id !== userId) throw new ConflictException('该手机号已被绑定');

    return this.prisma.user.update({
      where: { id: userId },
      data: { phone },
      select: { id: true, phone: true },
    });
  }

  /** 绑定邮箱 */
  async bindEmail(userId: string, email: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId) throw new ConflictException('该邮箱已被绑定');

    return this.prisma.user.update({
      where: { id: userId },
      data: { email },
      select: { id: true, email: true },
    });
  }

  /** 设置密码 */
  async setPassword(userId: string, oldPassword: string, newPassword: string) {
    const bcrypt = require('bcryptjs');
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
    if (!user) throw new NotFoundException('用户不存在');

    if (user.passwordHash) {
      const valid = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!valid) throw new BadRequestException('原密码错误');
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });

    await this.auditService.log({
      userId, action: 'UPDATE', resource: 'USER',
      resourceId: userId, detail: { field: 'password' },
    });

    return { success: true };
  }

  /** 注销账号 */
  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    if (user.status === 'DELETED') throw new BadRequestException('账号已注销');

    await this.prisma.$transaction([
      // 清除个人数据
      this.prisma.resume.deleteMany({ where: { userId } }),
      this.prisma.application.updateMany({ where: { userId }, data: { status: 'WITHDRAWN' } }),
      this.prisma.notification.deleteMany({ where: { userId } }),
      this.prisma.deviceSession.deleteMany({ where: { userId } }),
      this.prisma.passwordReset.deleteMany({ where: { userId } }),
      // 标记用户为已删除
      this.prisma.user.update({
        where: { id: userId },
        data: {
          status: 'DELETED',
          phone: null,
          email: null,
          nickname: `已注销_${userId.slice(0, 8)}`,
          avatar: null,
        },
      }),
    ]);

    await this.auditService.log({
      userId, action: 'DELETE', resource: 'USER',
      resourceId: userId, detail: { method: 'SELF_DELETE' },
    });

    return { success: true, message: '账号已注销' };
  }

  /** 获取用户统计数据 */
  async getUserStats(userId: string) {
    const [applicationCount, resumeCount, interviewCount] = await Promise.all([
      this.prisma.application.count({ where: { userId } }),
      this.prisma.resume.count({ where: { userId } }),
      this.prisma.application.count({
        where: { userId, status: 'INTERVIEW' },
      }),
    ]);

    return { applicationCount, resumeCount, interviewCount };
  }

  /** 获取用户投递历史 */
  async getApplications(userId: string, query: { page?: number; pageSize?: number; status?: string }) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const where: any = { userId };
    if (query.status) where.status = query.status;

    const [items, total] = await Promise.all([
      this.prisma.application.findMany({
        where, skip, take: pageSize, orderBy: { createdAt: 'desc' },
        include: {
          job: {
            select: { id: true, title: true, location: true, salaryMin: true, salaryMax: true },
          },
          resume: { select: { id: true, name: true } },
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }
}
