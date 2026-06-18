import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { parsePagination, paginatedResult } from '../../common/helpers/pagination';

@Injectable()
export class ApplicationService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  /** 求职者投递简历 */
  async apply(userId: string, jobId: string, resumeId: string, message?: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'OPEN') throw new NotFoundException('岗位不存在或已关闭');

    // 校验简历属于当前用户
    const resume = await this.prisma.resume.findFirst({ where: { id: resumeId, userId } });
    if (!resume) throw new NotFoundException('简历不存在');

    const existing = await this.prisma.application.findUnique({
      where: { jobId_userId: { jobId, userId } },
    });
    if (existing) throw new ConflictException('您已投递过该岗位');

    const application = await this.prisma.application.create({
      data: { jobId, userId, resumeId, message },
      include: { resume: true, user: { select: { id: true, nickname: true, avatar: true } } },
    });

    // 通知招聘方
    await this.notificationService.create({
      type: 'APPLICATION',
      title: '📩 新简历投递',
      content: `${resume.name} 投递了岗位「${job.title}」`,
      linkUrl: `/jobs/${jobId}/applications`,
      userId: job.publisherId,
    });

    return application;
  }

  /** 招聘方查看岗位收到的投递 */
  async getByJob(jobId: string, tenantId: string, query: any) {
    // 校验岗位属于该租户
    const job = await this.prisma.job.findFirst({ where: { id: jobId, tenantId } });
    if (!job) throw new NotFoundException('岗位不存在');

    const { skip, take, page, pageSize } = parsePagination(query);
    const where: any = { jobId };
    if (query.status) where.status = query.status;

    const [items, total] = await Promise.all([
      this.prisma.application.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: {
          resume: true,
          user: { select: { id: true, nickname: true, avatar: true } },
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return paginatedResult(items, total, page, pageSize);
  }

  /** 求职者查看我的投递 */
  async getMyApplications(userId: string, query: any) {
    const { skip, take, page, pageSize } = parsePagination(query);
    const where: any = { userId };
    if (query.status) where.status = query.status;

    const [items, total] = await Promise.all([
      this.prisma.application.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: {
          job: {
            select: {
              id: true, title: true, location: true, salaryMin: true, salaryMax: true,
              status: true, tenant: { select: { id: true, name: true, logo: true } },
            },
          },
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return paginatedResult(items, total, page, pageSize);
  }

  /** 更新申请状态（仅招聘方可操作） */
  async updateStatus(applicationId: string, tenantId: string, status: string, operatorId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: { select: { tenantId: true, title: true } } },
    });
    if (!app) throw new NotFoundException('申请不存在');
    if (app.job.tenantId !== tenantId) throw new ForbiddenException('无权操作');

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: status as any },
    });

    // 状态变更通知
    const statusMessages: Record<string, string> = {
      VIEWED: '👀 您的简历已被查看',
      ACCEPTED: '✅ 简历已通过筛选，招聘方将联系您',
      REJECTED: '❌ 简历未通过筛选',
      CHATTING: '💬 招聘方已发起沟通',
    };

    await this.notificationService.create({
      type: 'APPLICATION',
      title: '投递状态更新',
      content: statusMessages[status] || `状态变更为 ${status}`,
      linkUrl: `/applications/${applicationId}`,
      userId: app.userId,
    });

    return updated;
  }

  /** 批量更新投递状态 */
  async batchUpdateStatus(ids: string[], tenantId: string, status: string) {
    const apps = await this.prisma.application.findMany({
      where: { id: { in: ids } },
      include: { job: { select: { tenantId: true, title: true } } },
    });

    const validIds = apps.filter(a => a.job.tenantId === tenantId).map(a => a.id);
    if (validIds.length === 0) throw new ForbiddenException('无有效操作');

    await this.prisma.application.updateMany({
      where: { id: { in: validIds } },
      data: { status: status as any },
    });

    // 批量通知
    const notifications = apps
      .filter(a => validIds.includes(a.id))
      .map(a => ({
        type: 'APPLICATION' as const,
        title: '投递状态更新',
        content: `您在「${a.job.title}」的投递状态已更新为 ${status}`,
        userId: a.userId,
      }));
    await this.notificationService.batchCreate(notifications);

    return { success: true, updated: validIds.length };
  }
}
