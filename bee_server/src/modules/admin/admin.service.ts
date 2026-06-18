import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { parsePagination, paginatedResult } from '../../common/helpers/pagination';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // ============ 数据看板 ============

  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today.getTime() - 86400000);
    const weekAgo = new Date(today.getTime() - 7 * 86400000);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      tenantCount, userCount, jobCount, applicationCount,
      todayApps, yesterdayApps, weekApps, monthApps,
      activeSubs, trialSubs, expiredSubs,
      revenue, monthRevenue, paidOrders,
    ] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.user.count(),
      this.prisma.job.count({ where: { status: 'OPEN' } }),
      this.prisma.application.count(),
      this.prisma.application.count({ where: { createdAt: { gte: today } } }),
      this.prisma.application.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
      this.prisma.application.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.application.count({ where: { createdAt: { gte: monthStart } } }),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.subscription.count({ where: { status: 'TRIAL' } }),
      this.prisma.subscription.count({ where: { status: 'EXPIRED' } }),
      this.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
      this.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID', paidAt: { gte: monthStart } } }),
      this.prisma.payment.count({ where: { status: 'PAID' } }),
    ]);

    // 每日应用趋势（近 7 天）
    const dailyApps: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      const nextD = new Date(d.getTime() + 86400000);
      const count = await this.prisma.application.count({
        where: { createdAt: { gte: d, lt: nextD } },
      });
      dailyApps.push({ date: d.toISOString().slice(0, 10), count });
    }

    return {
      totals: {
        tenants: tenantCount, users: userCount, openJobs: jobCount,
        applications: applicationCount,
      },
      applications: {
        today: todayApps, yesterday: yesterdayApps,
        thisWeek: weekApps, thisMonth: monthApps,
        daily: dailyApps,
      },
      subscriptions: {
        active: activeSubs, trial: trialSubs, expired: expiredSubs,
        conversionRate: trialSubs > 0 ? Math.round((activeSubs / (activeSubs + trialSubs + expiredSubs)) * 100) : 0,
      },
      revenue: {
        total: revenue._sum.amount ?? 0,
        thisMonth: monthRevenue._sum.amount ?? 0,
        paidOrders,
      },
    };
  }

  // ============ 租户管理 ============

  async getTenants(params: {
    page?: number; pageSize?: number; status?: string;
    search?: string; verified?: boolean;
  }) {
    const { skip, take, page, pageSize } = parsePagination(params);
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.verified !== undefined) where.verified = params.verified;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { industry: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { jobs: true, members: true } },
          subscription: { include: { plan: true } },
        },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return paginatedResult(items, total, page, pageSize);
  }

  async getTenantDetail(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        members: { include: { user: { select: { id: true, nickname: true, avatar: true, phone: true } } } },
        subscription: { include: { plan: true } },
        payments: { orderBy: { createdAt: 'desc' }, take: 20 },
        _count: { select: { jobs: true, members: true } },
      },
    });
    if (!tenant) throw new NotFoundException('企业不存在');

    const jobs = await this.prisma.job.count({ where: { tenantId } });
    const apps = await this.prisma.application.count({
      where: { job: { tenantId } },
    });

    return { ...tenant, stats: { totalJobs: jobs, totalApplications: apps } };
  }

  async updateTenantStatus(tenantId: string, status: string, adminId: string) {
    if (!['ACTIVE', 'SUSPENDED', 'DELETED'].includes(status)) {
      throw new BadRequestException('无效状态');
    }
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId }, data: { status: status as any },
    });
    await this.auditService.log({
      userId: adminId, tenantId, action: 'UPDATE',
      resource: 'TENANT', resourceId: tenantId,
      detail: { field: 'status', value: status },
    });
    return tenant;
  }

  async verifyTenant(tenantId: string, adminId: string) {
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId }, data: { verified: true },
    });
    await this.auditService.log({
      userId: adminId, tenantId, action: 'UPDATE',
      resource: 'TENANT', resourceId: tenantId,
      detail: { field: 'verified', value: true },
    });
    return tenant;
  }

  // ============ 用户管理 ============

  async getUsers(params: {
    page?: number; pageSize?: number; role?: string;
    status?: string; search?: string;
  }) {
    const { skip, take, page, pageSize } = parsePagination(params);
    const where: any = {};
    if (params.role) where.role = params.role;
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { phone: { contains: params.search } },
        { nickname: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        select: {
          id: true, phone: true, email: true, nickname: true,
          avatar: true, role: true, status: true, createdAt: true,
          _count: { select: { applications: true, resumes: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return paginatedResult(items, total, page, pageSize);
  }

  async getUserDetail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenantMembers: { include: { tenant: { select: { id: true, name: true } } } },
        resumes: true,
        _count: { select: { applications: true } },
      },
    });
    if (!user) throw new NotFoundException('用户不存在');

    const loginLogs = await this.prisma.loginLog.findMany({
      where: { userId }, orderBy: { createdAt: 'desc' }, take: 20,
    });

    return { ...user, loginLogs };
  }

  async updateUserStatus(userId: string, status: string, adminId: string) {
    if (!['ACTIVE', 'BANNED', 'DELETED'].includes(status)) {
      throw new BadRequestException('无效状态');
    }
    const user = await this.prisma.user.update({
      where: { id: userId }, data: { status: status as any },
    });
    await this.auditService.log({
      userId: adminId, action: 'UPDATE', resource: 'USER',
      resourceId: userId, detail: { field: 'status', value: status },
    });
    // 封禁时踢出所有设备
    if (status === 'BANNED') {
      await this.prisma.deviceSession.deleteMany({ where: { userId } });
    }
    return { id: user.id, status: user.status };
  }

  // ============ 支付记录 ============

  async getAllPayments(params: { page?: number; pageSize?: number; status?: string }) {
    const { skip, take, page, pageSize } = parsePagination(params);
    const where: any = {};
    if (params.status) where.status = params.status;

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: {
          tenant: { select: { name: true } },
          user: { select: { nickname: true } },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return paginatedResult(items, total, page, pageSize);
  }

  // ============ 审计日志 ============

  async getAuditLogs(params: {
    page?: number; pageSize?: number; action?: string;
    resource?: string; tenantId?: string; userId?: string;
  }) {
    return this.auditService.query(params);
  }

  // ============ 系统配置 ============

  async getSystemConfigs() {
    return this.prisma.systemConfig.findMany({ orderBy: { key: 'asc' } });
  }

  async getSystemConfig(key: string) {
    const config = await this.prisma.systemConfig.findUnique({ where: { key } });
    if (!config) throw new NotFoundException('配置不存在');
    return config;
  }

  async setSystemConfig(key: string, value: string, description?: string, updatedBy?: string) {
    const config = await this.prisma.systemConfig.upsert({
      where: { key },
      create: { key, value, description, updatedBy },
      update: { value, description, updatedBy },
    });
    await this.auditService.log({
      userId: updatedBy, action: 'UPDATE', resource: 'SYSTEM_CONFIG',
      resourceId: key, detail: { value },
    });
    return config;
  }

  async deleteSystemConfig(key: string) {
    await this.prisma.systemConfig.delete({ where: { key } });
  }

  // ============ 登录日志（全局） ============

  async getLoginLogs(params: { page?: number; pageSize?: number; userId?: string; success?: boolean }) {
    const { skip, take, page, pageSize } = parsePagination(params);
    const where: any = {};
    if (params.userId) where.userId = params.userId;
    if (params.success !== undefined) where.success = params.success;

    const [items, total] = await Promise.all([
      this.prisma.loginLog.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.loginLog.count({ where }),
    ]);

    return paginatedResult(items, total, page, pageSize);
  }

  // ============ 数据导出 ============

  async exportTenants() {
    return this.prisma.tenant.findMany({
      include: {
        _count: { select: { jobs: true, members: true } },
        subscription: { include: { plan: true } },
      },
    });
  }

  async exportUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true, phone: true, email: true, nickname: true,
        role: true, status: true, createdAt: true,
      },
    });
  }
}
