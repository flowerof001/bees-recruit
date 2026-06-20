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
exports.TenantService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TenantService = class TenantService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const slug = this.generateSlug(dto.name);
        const existing = await this.prisma.tenant.findUnique({ where: { slug } });
        if (existing)
            throw new common_1.ConflictException('企业名称已被使用');
        const tenant = await this.prisma.tenant.create({
            data: {
                name: dto.name,
                slug,
                description: dto.description,
                industry: dto.industry,
                platformId: 'default',
                members: {
                    create: { userId: dto.ownerId, role: 'OWNER' },
                },
            },
            include: { members: true },
        });
        await this.prisma.user.update({
            where: { id: dto.ownerId },
            data: { role: 'RECRUITER' },
        });
        return tenant;
    }
    async getMyTenant(userId) {
        const member = await this.prisma.tenantMember.findFirst({
            where: { userId },
            include: { tenant: true },
        });
        return member?.tenant ?? null;
    }
    async getTenantById(tenantId) {
        return this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { members: { include: { user: { select: { id: true, nickname: true, avatar: true, phone: true } } } } },
        });
    }
    async addMember(tenantId, userId, role = 'RECRUITER') {
        const existing = await this.prisma.tenantMember.findUnique({
            where: { tenantId_userId: { tenantId, userId } },
        });
        if (existing)
            throw new common_1.ConflictException('该用户已在企业中');
        return this.prisma.tenantMember.create({ data: { tenantId, userId, role: role } });
    }
    async removeMember(tenantId, userId) {
        return this.prisma.tenantMember.delete({ where: { tenantId_userId: { tenantId, userId } } });
    }
    generateSlug(name) {
        const base = name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '').slice(0, 20);
        return `${base}_${Date.now().toString(36)}`;
    }
};
exports.TenantService = TenantService;
exports.TenantService = TenantService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantService);
//# sourceMappingURL=tenant.service.js.map