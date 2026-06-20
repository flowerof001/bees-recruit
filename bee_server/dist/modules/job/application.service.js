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
exports.ApplicationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notification_service_1 = require("../notification/notification.service");
const pagination_1 = require("../../common/helpers/pagination");
let ApplicationService = class ApplicationService {
    constructor(prisma, notificationService) {
        this.prisma = prisma;
        this.notificationService = notificationService;
    }
    async apply(userId, jobId, resumeId, message) {
        const job = await this.prisma.job.findUnique({ where: { id: jobId } });
        if (!job || job.status !== 'OPEN')
            throw new common_1.NotFoundException('岗位不存在或已关闭');
        const resume = await this.prisma.resume.findFirst({ where: { id: resumeId, userId } });
        if (!resume)
            throw new common_1.NotFoundException('简历不存在');
        const existing = await this.prisma.application.findUnique({
            where: { jobId_userId: { jobId, userId } },
        });
        if (existing)
            throw new common_1.ConflictException('您已投递过该岗位');
        const application = await this.prisma.application.create({
            data: { jobId, userId, resumeId, message },
            include: { resume: true, user: { select: { id: true, nickname: true, avatar: true } } },
        });
        await this.notificationService.create({
            type: 'APPLICATION',
            title: '📩 新简历投递',
            content: `${resume.name} 投递了岗位「${job.title}」`,
            linkUrl: `/jobs/${jobId}/applications`,
            userId: job.publisherId,
        });
        return application;
    }
    async getByJob(jobId, tenantId, query) {
        const job = await this.prisma.job.findFirst({ where: { id: jobId, tenantId } });
        if (!job)
            throw new common_1.NotFoundException('岗位不存在');
        const { skip, take, page, pageSize } = (0, pagination_1.parsePagination)(query);
        const where = { jobId };
        if (query.status)
            where.status = query.status;
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
        return (0, pagination_1.paginatedResult)(items, total, page, pageSize);
    }
    async getMyApplications(userId, query) {
        const { skip, take, page, pageSize } = (0, pagination_1.parsePagination)(query);
        const where = { userId };
        if (query.status)
            where.status = query.status;
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
        return (0, pagination_1.paginatedResult)(items, total, page, pageSize);
    }
    async updateStatus(applicationId, tenantId, status, operatorId) {
        const app = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: { job: { select: { tenantId: true, title: true } } },
        });
        if (!app)
            throw new common_1.NotFoundException('申请不存在');
        if (app.job.tenantId !== tenantId)
            throw new common_1.ForbiddenException('无权操作');
        const updated = await this.prisma.application.update({
            where: { id: applicationId },
            data: { status: status },
        });
        const statusMessages = {
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
    async batchUpdateStatus(ids, tenantId, status) {
        const apps = await this.prisma.application.findMany({
            where: { id: { in: ids } },
            include: { job: { select: { tenantId: true, title: true } } },
        });
        const validIds = apps.filter(a => a.job.tenantId === tenantId).map(a => a.id);
        if (validIds.length === 0)
            throw new common_1.ForbiddenException('无有效操作');
        await this.prisma.application.updateMany({
            where: { id: { in: validIds } },
            data: { status: status },
        });
        const notifications = apps
            .filter(a => validIds.includes(a.id))
            .map(a => ({
            type: 'APPLICATION',
            title: '投递状态更新',
            content: `您在「${a.job.title}」的投递状态已更新为 ${status}`,
            userId: a.userId,
        }));
        await this.notificationService.batchCreate(notifications);
        return { success: true, updated: validIds.length };
    }
};
exports.ApplicationService = ApplicationService;
exports.ApplicationService = ApplicationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService])
], ApplicationService);
//# sourceMappingURL=application.service.js.map