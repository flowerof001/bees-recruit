import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  /** 获取所有可用套餐 */
  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    });
  }

  /** 获取套餐详情 */
  async getPlan(planId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('套餐不存在');
    return plan;
  }

  /** 租户订阅/切换套餐 */
  async subscribe(tenantId: string, planId: string) {
    const plan = await this.getPlan(planId);
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('企业不存在');

    // 检查是否已有活跃订阅
    const currentSub = await this.prisma.subscription.findFirst({
      where: { tenantId, status: { in: ['ACTIVE', 'TRIAL'] } },
    });

    // 免费套餐直接激活
    if (plan.priceMonthly === 0) {
      if (currentSub) {
        await this.prisma.subscription.update({
          where: { id: currentSub.id },
          data: { status: 'CANCELLED' },
        });
      }
      return this.prisma.subscription.create({
        data: {
          tenantId, planId, platformId: 'default',
          status: 'ACTIVE', jobPostsUsed: 0, chatsUsed: 0,
        },
        include: { plan: true },
      });
    }

    // 付费套餐：取消旧订阅，创建新的（待支付）
    if (currentSub && currentSub.status === 'TRIAL') {
      // 试用期内升级，直接激活
      await this.prisma.subscription.update({
        where: { id: currentSub.id },
        data: { status: 'CANCELLED' },
      });
    }

    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return this.prisma.subscription.create({
      data: {
        tenantId, planId, platformId: 'default',
        status: 'TRIAL',
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14天试用
        jobPostsUsed: currentSub?.jobPostsUsed ?? 0,
        chatsUsed: currentSub?.chatsUsed ?? 0,
      },
      include: { plan: true },
    });
  }

  /** 激活订阅（支付成功后调用） */
  async activateSubscription(tenantId: string, planId: string) {
    const plan = await this.getPlan(planId);
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // 取消当前所有活跃订阅
    await this.prisma.subscription.updateMany({
      where: { tenantId, status: { in: ['ACTIVE', 'TRIAL'] } },
      data: { status: 'CANCELLED' },
    });

    const sub = await this.prisma.subscription.create({
      data: {
        tenantId, planId, platformId: 'default',
        status: 'ACTIVE', endDate, autoRenew: true,
        jobPostsUsed: 0, chatsUsed: 0,
      },
      include: { plan: true, tenant: { select: { name: true } } },
    });

    // 发送通知给企业成员
    const members = await this.prisma.tenantMember.findMany({
      where: { tenantId }, select: { userId: true },
    });
    await this.notificationService.batchCreate(
      members.map(m => ({
        type: 'SYSTEM',
        title: '🎉 订阅已激活',
        content: `企业「${sub.tenant.name}」已成功订阅「${plan.nameCN}」套餐`,
        userId: m.userId,
      })),
    );

    return sub;
  }

  /** 续费（延长到期时间） */
  async renew(tenantId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { tenantId, status: 'ACTIVE' },
      include: { plan: true },
    });
    if (!sub) throw new NotFoundException('没有活跃的订阅');

    const currentEnd = sub.endDate ?? new Date();
    const newEnd = new Date(Math.max(currentEnd.getTime(), Date.now()) + 30 * 24 * 60 * 60 * 1000);

    return this.prisma.subscription.update({
      where: { id: sub.id },
      data: { endDate: newEnd, chatsUsed: 0 },
      include: { plan: true },
    });
  }

  /** 获取租户当前订阅 */
  async getCurrentSubscription(tenantId: string) {
    return this.prisma.subscription.findFirst({
      where: { tenantId, status: { in: ['ACTIVE', 'TRIAL'] } },
      include: { plan: true },
    });
  }

  /** 获取租户订阅历史 */
  async getSubscriptionHistory(tenantId: string) {
    return this.prisma.subscription.findMany({
      where: { tenantId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** 检查岗位发布权限 */
  async canPostJob(tenantId: string): Promise<boolean> {
    const sub = await this.getCurrentSubscription(tenantId);
    if (!sub) return false;
    if (sub.status === 'EXPIRED') return false;
    if (sub.jobPostsUsed >= sub.plan.maxJobs) {
      throw new ForbiddenException(`已达到最大岗位数(${sub.plan.maxJobs})，请升级套餐或关闭旧岗位`);
    }
    return true;
  }

  /** 检查聊天权限 */
  async canChat(tenantId: string): Promise<boolean> {
    const sub = await this.getCurrentSubscription(tenantId);
    if (!sub) return false;
    if (sub.chatsUsed >= sub.plan.maxChatsPerDay) {
      throw new ForbiddenException(`今日沟通次数已用完(${sub.plan.maxChatsPerDay})，请明日再试或升级套餐`);
    }
    return true;
  }

  /** 扣减聊天次数 */
  async incrementChatUsed(tenantId: string) {
    await this.prisma.subscription.updateMany({
      where: { tenantId, status: { in: ['ACTIVE', 'TRIAL'] } },
      data: { chatsUsed: { increment: 1 } },
    });
  }

  /** 每日重置聊天计数（由定时任务调用） */
  async resetDailyChatCounts() {
    await this.prisma.subscription.updateMany({
      where: { status: { in: ['ACTIVE', 'TRIAL'] } },
      data: { chatsUsed: 0 },
    });
  }

  /** 检查过期订阅并处理 */
  async checkExpiredSubscriptions() {
    const expired = await this.prisma.subscription.updateMany({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] },
        endDate: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    });

    if (expired.count > 0) {
      console.log(`[Subscription] ${expired.count} 个订阅已过期`);
    }
    return expired.count;
  }
}
