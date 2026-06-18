import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { parsePagination, paginatedResult } from '../../common/helpers/pagination';
import { SubscriptionService } from '../subscription/subscription.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class JobService {
  constructor(
    private prisma: PrismaService,
    private subscriptionService: SubscriptionService,
    private notificationService: NotificationService,
  ) {}

  async create(tenantId: string, publisherId: string, dto: any) {
    // 检查订阅权限
    const canPost = await this.subscriptionService.canPostJob(tenantId);
    if (!canPost) throw new ForbiddenException('已达到岗位发布上限，请升级套餐');

    const job = await this.prisma.job.create({
      data: { ...dto, tenantId, publisherId },
    });

    // 扣减可用岗位数
    await this.prisma.subscription.updateMany({
      where: { tenantId, status: { in: ['ACTIVE', 'TRIAL'] } },
      data: { jobPostsUsed: { increment: 1 } },
    });

    return job;
  }

  async search(query: any) {
    const { skip, take, page, pageSize } = parsePagination(query);
    const where: any = { status: 'OPEN' };

    if (query.keyword) {
      where.OR = [
        { title: { contains: query.keyword, mode: 'insensitive' } },
        { description: { contains: query.keyword, mode: 'insensitive' } },
        { tags: { has: query.keyword } },
      ];
    }
    if (query.location) where.location = { contains: query.location, mode: 'insensitive' };
    if (query.salaryMin) where.salaryMax = { gte: parseInt(query.salaryMin) };
    if (query.salaryMax) where.salaryMin = { lte: parseInt(query.salaryMax) };
    if (query.tag) where.tags = { has: query.tag };
    if (query.locationType) where.locationType = query.locationType;

    const orderBy: any = {};
    if (query.orderBy === 'salary') {
      orderBy.salaryMax = query.order || 'desc';
    } else if (query.orderBy === 'createdAt') {
      orderBy.createdAt = query.order || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.job.findMany({
        where, skip, take, orderBy,
        include: {
          tenant: { select: { id: true, name: true, logo: true, verified: true, scale: true, industry: true } },
          publisher: { select: { id: true, nickname: true, avatar: true } },
          _count: { select: { applications: true } },
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return paginatedResult(items, total, page, pageSize);
  }

  async getById(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        tenant: {
          select: { id: true, name: true, logo: true, verified: true, scale: true, industry: true, description: true },
        },
        publisher: { select: { id: true, nickname: true, avatar: true } },
        _count: { select: { applications: true } },
      },
    });
    if (!job || job.status === 'CLOSED') throw new NotFoundException('岗位不存在或已关闭');

    await this.prisma.job.update({ where: { id: jobId }, data: { viewCount: { increment: 1 } } });

    return job;
  }

  async getByTenant(tenantId: string, query: any) {
    const { skip, take, page, pageSize } = parsePagination(query);
    const where: any = { tenantId };
    if (query.status) where.status = query.status;

    const [items, total] = await Promise.all([
      this.prisma.job.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: { _count: { select: { applications: true } } },
      }),
      this.prisma.job.count({ where }),
    ]);

    return paginatedResult(items, total, page, pageSize);
  }

  async update(jobId: string, tenantId: string, dto: any) {
    const job = await this.prisma.job.findFirst({ where: { id: jobId, tenantId } });
    if (!job) throw new NotFoundException('岗位不存在');
    return this.prisma.job.update({ where: { id: jobId }, data: dto });
  }

  async close(jobId: string, tenantId: string) {
    const result = await this.prisma.job.updateMany({
      where: { id: jobId, tenantId },
      data: { status: 'CLOSED' },
    });
    if (result.count === 0) throw new NotFoundException('岗位不存在');
    return { success: true };
  }

  async reopen(jobId: string, tenantId: string) {
    const result = await this.prisma.job.updateMany({
      where: { id: jobId, tenantId },
      data: { status: 'OPEN' },
    });
    if (result.count === 0) throw new NotFoundException('岗位不存在');
    return { success: true };
  }
}
