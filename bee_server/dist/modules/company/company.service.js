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
exports.CompanyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let CompanyService = class CompanyService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async getPublicProfile(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: {
                id: true, name: true, logo: true, description: true,
                industry: true, scale: true, verified: true, createdAt: true,
            },
        });
        if (!tenant)
            throw new common_1.NotFoundException('企业不存在');
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
    async updateProfile(tenantId, userId, dto) {
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
    async create(userId, dto) {
        const existingMembership = await this.prisma.tenantMember.findFirst({
            where: { userId },
        });
        if (existingMembership)
            throw new common_1.BadRequestException('您已加入一个企业，请先退出');
        const slug = dto.slug ?? dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const existing = await this.prisma.tenant.findUnique({ where: { slug } });
        if (existing)
            throw new common_1.BadRequestException('该企业标识已被使用');
        const tenant = await this.prisma.tenant.create({
            data: {
                name: dto.name, slug,
                description: dto.description,
                industry: dto.industry,
                scale: dto.scale,
                platformId: 'default',
            },
        });
        await this.prisma.tenantMember.create({
            data: { tenantId: tenant.id, userId, role: 'OWNER' },
        });
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
    async join(tenantId, userId) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('企业不存在');
        if (tenant.status !== 'ACTIVE')
            throw new common_1.BadRequestException('企业已被停用');
        const existing = await this.prisma.tenantMember.findFirst({
            where: { tenantId, userId },
        });
        if (existing)
            throw new common_1.BadRequestException('您已是该企业成员');
        const otherMembership = await this.prisma.tenantMember.findFirst({
            where: { userId, tenantId: { not: tenantId } },
        });
        if (otherMembership)
            throw new common_1.BadRequestException('您已加入其他企业，请先退出');
        await this.prisma.tenantMember.create({
            data: { tenantId, userId, role: 'RECRUITER' },
        });
        await this.auditService.log({
            tenantId, userId, action: 'CREATE', resource: 'TENANT_MEMBER',
            resourceId: tenantId,
        });
        return { success: true, message: '已加入企业' };
    }
    async leave(tenantId, userId) {
        const membership = await this.prisma.tenantMember.findFirst({
            where: { tenantId, userId },
        });
        if (!membership)
            throw new common_1.NotFoundException('不是该企业成员');
        if (membership.role === 'OWNER')
            throw new common_1.BadRequestException('企业所有者不能直接退出，请先转让所有权');
        await this.prisma.tenantMember.delete({ where: { id: membership.id } });
        await this.auditService.log({
            tenantId, userId, action: 'DELETE', resource: 'TENANT_MEMBER',
            resourceId: tenantId,
        });
        return { success: true, message: '已退出企业' };
    }
    async getMembers(tenantId, userId) {
        await this.requireMember(tenantId, userId);
        return this.prisma.tenantMember.findMany({
            where: { tenantId },
            include: {
                user: { select: { id: true, nickname: true, avatar: true, phone: true, role: true } },
            },
            orderBy: { joinedAt: 'asc' },
        });
    }
    async removeMember(tenantId, operatorId, targetUserId) {
        await this.requireOwnerOrAdmin(tenantId, operatorId);
        const membership = await this.prisma.tenantMember.findFirst({
            where: { tenantId, userId: targetUserId },
        });
        if (!membership)
            throw new common_1.NotFoundException('成员不存在');
        if (membership.role === 'OWNER')
            throw new common_1.BadRequestException('不能移除企业所有者');
        await this.prisma.tenantMember.delete({ where: { id: membership.id } });
        await this.auditService.log({
            tenantId, userId: operatorId, action: 'DELETE', resource: 'TENANT_MEMBER',
            resourceId: targetUserId, detail: { removedUserId: targetUserId },
        });
        return { success: true, message: '成员已移除' };
    }
    async updateMemberRole(tenantId, operatorId, targetUserId, role) {
        await this.requireOwnerOrAdmin(tenantId, operatorId);
        if (!['ADMIN', 'RECRUITER'].includes(role))
            throw new common_1.BadRequestException('无效角色');
        const membership = await this.prisma.tenantMember.findFirst({
            where: { tenantId, userId: targetUserId },
        });
        if (!membership)
            throw new common_1.NotFoundException('成员不存在');
        if (membership.role === 'OWNER')
            throw new common_1.BadRequestException('不能修改所有者的角色');
        await this.prisma.tenantMember.update({
            where: { id: membership.id },
            data: { role: role },
        });
        await this.auditService.log({
            tenantId, userId: operatorId, action: 'UPDATE', resource: 'TENANT_MEMBER',
            resourceId: targetUserId, detail: { newRole: role },
        });
        return { success: true, message: '角色已更新' };
    }
    async getMyTenant(userId) {
        const membership = await this.prisma.tenantMember.findFirst({
            where: { userId },
            include: { tenant: true },
        });
        if (!membership)
            return null;
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
    async searchCompanies(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const skip = (page - 1) * pageSize;
        const where = { status: 'ACTIVE' };
        if (query.keyword) {
            where.OR = [
                { name: { contains: query.keyword, mode: 'insensitive' } },
                { description: { contains: query.keyword, mode: 'insensitive' } },
            ];
        }
        if (query.industry)
            where.industry = query.industry;
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
    async getMyTenantBrief(userId) {
        const membership = await this.prisma.tenantMember.findFirst({
            where: { userId },
            include: { tenant: true },
        });
        if (!membership)
            return null;
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
    async requireMember(tenantId, userId) {
        const member = await this.prisma.tenantMember.findFirst({
            where: { tenantId, userId },
        });
        if (!member)
            throw new common_1.ForbiddenException('您不是该企业成员');
    }
    async requireOwnerOrAdmin(tenantId, userId) {
        const member = await this.prisma.tenantMember.findFirst({
            where: { tenantId, userId },
        });
        if (!member)
            throw new common_1.ForbiddenException('您不是该企业成员');
        if (!['OWNER', 'ADMIN'].includes(member.role))
            throw new common_1.ForbiddenException('仅企业管理员可执行此操作');
    }
};
exports.CompanyService = CompanyService;
exports.CompanyService = CompanyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], CompanyService);
//# sourceMappingURL=company.service.js.map