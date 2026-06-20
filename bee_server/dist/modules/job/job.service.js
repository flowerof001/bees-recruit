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
exports.JobService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/helpers/pagination");
const subscription_service_1 = require("../subscription/subscription.service");
const notification_service_1 = require("../notification/notification.service");
let JobService = class JobService {
    constructor(prisma, subscriptionService, notificationService) {
        this.prisma = prisma;
        this.subscriptionService = subscriptionService;
        this.notificationService = notificationService;
    }
    async create(tenantId, publisherId, dto) {
        const canPost = await this.subscriptionService.canPostJob(tenantId);
        if (!canPost)
            throw new common_1.ForbiddenException('已达到岗位发布上限，请升级套餐');
        const job = await this.prisma.job.create({
            data: { ...dto, tenantId, publisherId },
        });
        await this.prisma.subscription.updateMany({
            where: { tenantId, status: { in: ['ACTIVE', 'TRIAL'] } },
            data: { jobPostsUsed: { increment: 1 } },
        });
        return job;
    }
    async search(query) {
        const { skip, take, page, pageSize } = (0, pagination_1.parsePagination)(query);
        const where = { status: 'OPEN' };
        if (query.keyword) {
            where.OR = [
                { title: { contains: query.keyword, mode: 'insensitive' } },
                { description: { contains: query.keyword, mode: 'insensitive' } },
                { tags: { has: query.keyword } },
            ];
        }
        if (query.location)
            where.location = { contains: query.location, mode: 'insensitive' };
        if (query.salaryMin)
            where.salaryMax = { gte: parseInt(query.salaryMin) };
        if (query.salaryMax)
            where.salaryMin = { lte: parseInt(query.salaryMax) };
        if (query.tag)
            where.tags = { has: query.tag };
        if (query.locationType)
            where.locationType = query.locationType;
        const orderBy = {};
        if (query.orderBy === 'salary') {
            orderBy.salaryMax = query.order || 'desc';
        }
        else if (query.orderBy === 'createdAt') {
            orderBy.createdAt = query.order || 'desc';
        }
        else {
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
        return (0, pagination_1.paginatedResult)(items, total, page, pageSize);
    }
    async getById(jobId) {
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
        if (!job || job.status === 'CLOSED')
            throw new common_1.NotFoundException('岗位不存在或已关闭');
        await this.prisma.job.update({ where: { id: jobId }, data: { viewCount: { increment: 1 } } });
        return job;
    }
    async getByTenant(tenantId, query) {
        const { skip, take, page, pageSize } = (0, pagination_1.parsePagination)(query);
        const where = { tenantId };
        if (query.status)
            where.status = query.status;
        const [items, total] = await Promise.all([
            this.prisma.job.findMany({
                where, skip, take, orderBy: { createdAt: 'desc' },
                include: { _count: { select: { applications: true } } },
            }),
            this.prisma.job.count({ where }),
        ]);
        return (0, pagination_1.paginatedResult)(items, total, page, pageSize);
    }
    async update(jobId, tenantId, dto) {
        const job = await this.prisma.job.findFirst({ where: { id: jobId, tenantId } });
        if (!job)
            throw new common_1.NotFoundException('岗位不存在');
        return this.prisma.job.update({ where: { id: jobId }, data: dto });
    }
    async close(jobId, tenantId) {
        const result = await this.prisma.job.updateMany({
            where: { id: jobId, tenantId },
            data: { status: 'CLOSED' },
        });
        if (result.count === 0)
            throw new common_1.NotFoundException('岗位不存在');
        return { success: true };
    }
    async reopen(jobId, tenantId) {
        const result = await this.prisma.job.updateMany({
            where: { id: jobId, tenantId },
            data: { status: 'OPEN' },
        });
        if (result.count === 0)
            throw new common_1.NotFoundException('岗位不存在');
        return { success: true };
    }
};
exports.JobService = JobService;
exports.JobService = JobService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        subscription_service_1.SubscriptionService,
        notification_service_1.NotificationService])
], JobService);
//# sourceMappingURL=job.service.js.map