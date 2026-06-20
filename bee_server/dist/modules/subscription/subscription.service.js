"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notification_service_1 = require("../notification/notification.service");
let SubscriptionService = class SubscriptionService {
    constructor(prisma, notificationService) {
        this.prisma = prisma;
        this.notificationService = notificationService;
    }
    async getPlans() {
        return this.prisma.subscriptionPlan.findMany({
            where: { isActive: true },
            orderBy: { priceMonthly: 'asc' },
        });
    }
    async getPlan(planId) {
        const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        if (!plan)
            throw new common_1.NotFoundException('套餐不存在');
        return plan;
    }
    async subscribe(tenantId, planId) {
        const plan = await this.getPlan(planId);
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('企业不存在');
        const currentSub = await this.prisma.subscription.findFirst({
            where: { tenantId, status: { in: ['ACTIVE', 'TRIAL'] } },
        });
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
        if (currentSub && currentSub.status === 'TRIAL') {
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
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                jobPostsUsed: currentSub?.jobPostsUsed ?? 0,
                chatsUsed: currentSub?.chatsUsed ?? 0,
            },
            include: { plan: true },
        });
    }
    async activateSubscription(tenantId, planId) {
        const plan = await this.getPlan(planId);
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
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
        const members = await this.prisma.tenantMember.findMany({
            where: { tenantId }, select: { userId: true },
        });
        await this.notificationService.batchCreate(members.map(m => ({
            type: 'SYSTEM',
            title: '🎉 订阅已激活',
            content: `企业「${sub.tenant.name}」已成功订阅「${plan.nameCN}」套餐`,
            userId: m.userId,
        })));
        return sub;
    }
    async renew(tenantId) {
        const sub = await this.prisma.subscription.findFirst({
            where: { tenantId, status: 'ACTIVE' },
            include: { plan: true },
        });
        if (!sub)
            throw new common_1.NotFoundException('没有活跃的订阅');
        const currentEnd = sub.endDate ?? new Date();
        const newEnd = new Date(Math.max(currentEnd.getTime(), Date.now()) + 30 * 24 * 60 * 60 * 1000);
        return this.prisma.subscription.update({
            where: { id: sub.id },
            data: { endDate: newEnd, chatsUsed: 0 },
            include: { plan: true },
        });
    }
    async getCurrentSubscription(tenantId) {
        return this.prisma.subscription.findFirst({
            where: { tenantId, status: { in: ['ACTIVE', 'TRIAL'] } },
            include: { plan: true },
        });
    }
    async getSubscriptionHistory(tenantId) {
        return this.prisma.subscription.findMany({
            where: { tenantId },
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async canPostJob(tenantId) {
        const sub = await this.getCurrentSubscription(tenantId);
        if (!sub)
            return false;
        if (sub.status === 'EXPIRED')
            return false;
        if (sub.jobPostsUsed >= sub.plan.maxJobs) {
            throw new common_1.ForbiddenException(`已达到最大岗位数(${sub.plan.maxJobs})，请升级套餐或关闭旧岗位`);
        }
        return true;
    }
    async canChat(tenantId) {
        const sub = await this.getCurrentSubscription(tenantId);
        if (!sub)
            return false;
        if (sub.chatsUsed >= sub.plan.maxChatsPerDay) {
            throw new common_1.ForbiddenException(`今日沟通次数已用完(${sub.plan.maxChatsPerDay})，请明日再试或升级套餐`);
        }
        return true;
    }
    async incrementChatUsed(tenantId) {
        await this.prisma.subscription.updateMany({
            where: { tenantId, status: { in: ['ACTIVE', 'TRIAL'] } },
            data: { chatsUsed: { increment: 1 } },
        });
    }
    async resetDailyChatCounts() {
        await this.prisma.subscription.updateMany({
            where: { status: { in: ['ACTIVE', 'TRIAL'] } },
            data: { chatsUsed: 0 },
        });
    }
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
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map