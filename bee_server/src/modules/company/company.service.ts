import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /** 公开企业主页 */
  async getPublicProfile(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true, name: true, logo: true, description: true,
        industry: true, scale: true, verified: true, createdAt: true,
      },
    });
    if (!tenant) throw new NotFoundException('企业不存在');

    const [jobCount, openJobs] = await Promise.all([
      this.prisma.job.count({ where: { tenantId } }),
      this.prisma.job.findMany({
        where: { tenantId, status: 'OPEN' },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, title: true, location: true, salaryMin: true, salaryMax: true,
          tags: true, createdAt: true,
        },
      }),
    ]);

    return { ...tenant, jobCount, openJobs };
  }

  /** 更新企业信息 */
  async updateProfile(tenantId: string, userId: string, dto: {
    name?: string; description?: string; industry?: string;
    scale?: string; logo?: string;
  }) {
    await this.requireOwnerOrAdmin(tenantId, userId);

    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: dto,
    });

    await this.auditService.log({
      tenantId, userId, action: 'UPDATE', resource: 'TENANT',
      resourceId: tenantId, detail: dto,
    });

    return tenant;
  }

  /** 创建企业（注册时） */
  async create(userId: string, dto: {
    name: string; slug?: string; description?: string;
    industry?: string; scale?: string;
  }) {
    // 检查用户是否已有企业
    const existingMembership = await this.prisma.tenantMember.findFirst({
      where: { userId },
    });
    if (existingMembership) throw new BadRequestException('您已加入一个企业，请先退出');

    const slug = dto.slug ?? dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const existing = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existing) throw new BadRequestException('该企业标识已被使用');

    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.name, slug,
        description: dto.description,
        industry: dto.industry,
        scale: dto.scale,
        platformId: 'default',
      },
    });

    // 创建者设为 OWNER
    await this.prisma.tenantMember.create({
      data: { tenantId: tenant.id, userId, role: 'OWNER' },
    });

    // 免费套餐试用
    await this.prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: 'FREE',
        platformId: 'default',
        status: 'TRIAL',
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    await this.auditService.log({
      tenantId: tenant.id, userId, action: 'CREATE', resource: 'TENANT',
      resourceId: tenant.id,
    });

    return tenant;
  }

  /** 加入企业 */
  async join(tenantId: string, userId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('企业不存在');
    if (tenant.status !== 'ACTIVE') throw new BadRequestException('企业已被停用');

    const existing = await this.prisma.tenantMember.findFirst({
      where: { tenantId, userId },
    });
    if (existing) throw new BadRequestException('您已是该企业成员');

    // 检查是否已加入其他企业
    const otherMembership = await this.prisma.tenantMember.findFirst({
      where: { userId, tenantId: { not: tenantId } },
    });
    if (otherMembership) throw new BadRequestException('您已加入其他企业，请先退出');

    await this.prisma.tenantMember.create({
      data: { tenantId, userId, role: 'RECRUITER' },
    });

    await this.auditService.log({
      tenantId, userId, action: 'CREATE', resource: 'TENANT_MEMBER',
      resourceId: tenantId,
    });

    return { success: true, message: '已加入企业' };
  }

  /** 离开企业 */
  async leave(tenantId: string, userId: string) {
    const membership = await this.prisma.tenantMember.findFirst({
      where: { tenantId, userId },
    });
    if (!membership) throw new NotFoundException('不是该企业成员');
    if (membership.role === 'OWNER') throw new BadRequestException('企业所有者不能直接退出，请先转让所有权');

    await this.prisma.tenantMember.delete({ where: { id: membership.id } });

    await this.auditService.log({
      tenantId, userId, action: 'DELETE', resource: 'TENANT_MEMBER',
      resourceId: tenantId,
    });

    return { success: true, message: '已退出企业' };
  }

  /** 获取企业成员 */
  async getMembers(tenantId: string, userId: string) {
    await this.requireMember(tenantId, userId);

    return this.prisma.tenantMember.findMany({
      where: { tenantId },
      include: {
        user: { select: { id: true, nickname: true, avatar: true, phone: true, role: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  /** 移除成员 */
  async removeMember(tenantId: string, operatorId: string, targetUserId: string) {
    await this.requireOwnerOrAdmin(tenantId, operatorId);

    const membership = await this.prisma.tenantMember.findFirst({
      where: { tenantId, userId: targetUserId },
    });
    if (!membership) throw new NotFoundException('成员不存在');
    if (membership.role === 'OWNER') throw new BadRequestException('不能移除企业所有者');

    await this.prisma.tenantMember.delete({ where: { id: membership.id } });

    await this.auditService.log({
      tenantId, userId: operatorId, action: 'DELETE', resource: 'TENANT_MEMBER',
      resourceId: targetUserId, detail: { removedUserId: targetUserId },
    });

    return { success: true, message: '成员已移除' };
  }

  /** 修改成员角色 */
  async updateMemberRole(tenantId: string, operatorId: string, targetUserId: string, role: string) {
    await this.requireOwnerOrAdmin(tenantId, operatorId);

    if (!['ADMIN', 'RECRUITER'].includes(role)) throw new BadRequestException('无效角色');

    const membership = await this.prisma.tenantMember.findFirst({
      where: { tenantId, userId: targetUserId },
    });
    if (!membership) throw new NotFoundException('成员不存在');
    if (membership.role === 'OWNER') throw new BadRequestException('不能修改所有者的角色');

    await this.prisma.tenantMember.update({
      where: { id: membership.id },
      data: { role: role as any },
    });

    await this.auditService.log({
      tenantId, userId: operatorId, action: 'UPDATE', resource: 'TENANT_MEMBER',
      resourceId: targetUserId, detail: { newRole: role },
    });

    return { success: true, message: '角色已更新' };
  }

  /** 获取用户所属企业 */
  async getMyTenant(userId: string) {
    const membership = await this.prisma.tenantMember.findFirst({
      where: { userId },
      include: { tenant: true },
    });
    if (!membership) return null;

    const tenant = membership.tenant;
    const [jobCount, memberCount, subscription] = await Promise.all([
      this.prisma.job.count({ where: { tenantId: tenant.id } }),
      this.prisma.tenantMember.count({ where: { tenantId: tenant.id } }),
      this.prisma.subscription.findFirst({
        where: { tenantId: tenant.id, status: { in: ['ACTIVE', 'TRIAL'] } },
        include: { plan: true },
      }),
    ]);

    return { ...tenant, myRole: membership.role, jobCount, memberCount, subscription };
  }

  /** 搜索企业 */
  async searchCompanies(query: { keyword?: string; industry?: string; page?: number; pageSize?: number }) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const where: any = { status: 'ACTIVE' };

    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword, mode: 'insensitive' } },
        { description: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }
    if (query.industry) where.industry = query.industry;

    const [items, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where, skip, take: pageSize, orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, logo: true, description: true,
          industry: true, scale: true, verified: true,
          _count: { select: { jobs: true } },
        },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /** 我的企业简要信息 */
  async getMyTenantBrief(userId: string) {
    const membership = await this.prisma.tenantMember.findFirst({
      where: { userId },
      include: { tenant: true },
    });
    if (!membership) return null;

    const appCount = await this.prisma.application.count({
      where: { job: { tenantId: membership.tenantId } },
    });

    return {
      id: membership.tenant.id,
      name: membership.tenant.name,
      logo: membership.tenant.logo,
      verified: membership.tenant.verified,
      myRole: membership.role,
      newApplications: appCount,
    };
  }

  // ============ 权限校验 ============

  private async requireMember(tenantId: string, userId: string) {
    const member = await this.prisma.tenantMember.findFirst({
      where: { tenantId, userId },
    });
    if (!member) throw new ForbiddenException('您不是该企业成员');
  }

  private async requireOwnerOrAdmin(tenantId: string, userId: string) {
    const member = await this.prisma.tenantMember.findFirst({
      where: { tenantId, userId },
    });
    if (!member) throw new ForbiddenException('您不是该企业成员');
    if (!['OWNER', 'ADMIN'].includes(member.role)) throw new ForbiddenException('仅企业管理员可执行此操作');
  }
}
