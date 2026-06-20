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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const pagination_1 = require("../../common/helpers/pagination");
let AdminService = class AdminService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async getDashboard() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today.getTime() - 86400000);
        const weekAgo = new Date(today.getTime() - 7 * 86400000);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const [tenantCount, userCount, jobCount, applicationCount, todayApps, yesterdayApps, weekApps, monthApps, activeSubs, trialSubs, expiredSubs, revenue, monthRevenue, paidOrders,] = await Promise.all([
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
        const dailyApps = [];
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
    async getTenants(params) {
        const { skip, take, page, pageSize } = (0, pagination_1.parsePagination)(params);
        const where = {};
        if (params.status)
            where.status = params.status;
        if (params.verified !== undefined)
            where.verified = params.verified;
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
        return (0, pagination_1.paginatedResult)(items, total, page, pageSize);
    }
    async getTenantDetail(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                members: { include: { user: { select: { id: true, nickname: true, avatar: true, phone: true } } } },
                subscription: { include: { plan: true } },
                payments: { orderBy: { createdAt: 'desc' }, take: 20 },
                _count: { select: { jobs: true, members: true } },
            },
        });
        if (!tenant)
            throw new common_1.NotFoundException('企业不存在');
        const jobs = await this.prisma.job.count({ where: { tenantId } });
        const apps = await this.prisma.application.count({
            where: { job: { tenantId } },
        });
        return { ...tenant, stats: { totalJobs: jobs, totalApplications: apps } };
    }
    async updateTenantStatus(tenantId, status, adminId) {
        if (!['ACTIVE', 'SUSPENDED', 'DELETED'].includes(status)) {
            throw new common_1.BadRequestException('无效状态');
        }
        const tenant = await this.prisma.tenant.update({
            where: { id: tenantId }, data: { status: status },
        });
        await this.auditService.log({
            userId: adminId, tenantId, action: 'UPDATE',
            resource: 'TENANT', resourceId: tenantId,
            detail: { field: 'status', value: status },
        });
        return tenant;
    }
    async verifyTenant(tenantId, adminId) {
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
    async getUsers(params) {
        const { skip, take, page, pageSize } = (0, pagination_1.parsePagination)(params);
        const where = {};
        if (params.role)
            where.role = params.role;
        if (params.status)
            where.status = params.status;
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
        return (0, pagination_1.paginatedResult)(items, total, page, pageSize);
    }
    async getUserDetail(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                tenantMembers: { include: { tenant: { select: { id: true, name: true } } } },
                resumes: true,
                _count: { select: { applications: true } },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('用户不存在');
        const loginLogs = await this.prisma.loginLog.findMany({
            where: { userId }, orderBy: { createdAt: 'desc' }, take: 20,
        });
        return { ...user, loginLogs };
    }
    async updateUserStatus(userId, status, adminId) {
        if (!['ACTIVE', 'BANNED', 'DELETED'].includes(status)) {
            throw new common_1.BadRequestException('无效状态');
        }
        const user = await this.prisma.user.update({
            where: { id: userId }, data: { status: status },
        });
        await this.auditService.log({
            userId: adminId, action: 'UPDATE', resource: 'USER',
            resourceId: userId, detail: { field: 'status', value: status },
        });
        if (status === 'BANNED') {
            await this.prisma.deviceSession.deleteMany({ where: { userId } });
        }
        return { id: user.id, status: user.status };
    }
    async getAllPayments(params) {
        const { skip, take, page, pageSize } = (0, pagination_1.parsePagination)(params);
        const where = {};
        if (params.status)
            where.status = params.status;
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
        return (0, pagination_1.paginatedResult)(items, total, page, pageSize);
    }
    async getAuditLogs(params) {
        return this.auditService.query(params);
    }
    async getSystemConfigs() {
        return this.prisma.systemConfig.findMany({ orderBy: { key: 'asc' } });
    }
    async getSystemConfig(key) {
        const config = await this.prisma.systemConfig.findUnique({ where: { key } });
        if (!config)
            throw new common_1.NotFoundException('配置不存在');
        return config;
    }
    async setSystemConfig(key, value, description, updatedBy) {
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
    async deleteSystemConfig(key) {
        await this.prisma.systemConfig.delete({ where: { key } });
    }
    async getLoginLogs(params) {
        const { skip, take, page, pageSize } = (0, pagination_1.parsePagination)(params);
        const where = {};
        if (params.userId)
            where.userId = params.userId;
        if (params.success !== undefined)
            where.success = params.success;
        const [items, total] = await Promise.all([
            this.prisma.loginLog.findMany({
                where, skip, take, orderBy: { createdAt: 'desc' },
            }),
            this.prisma.loginLog.count({ where }),
        ]);
        return (0, pagination_1.paginatedResult)(items, total, page, pageSize);
    }
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], AdminService);
//# sourceMappingURL=admin.service.js.map