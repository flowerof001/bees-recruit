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
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/helpers/pagination");
let AuditService = AuditService_1 = class AuditService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuditService_1.name);
    }
    async log(entry) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    tenantId: entry.tenantId,
                    userId: entry.userId,
                    action: entry.action,
                    resource: entry.resource,
                    resourceId: entry.resourceId,
                    detail: entry.detail ?? undefined,
                    ip: entry.ip,
                },
            });
        }
        catch (err) {
            this.logger.error(`审计日志写入失败: ${err.message}`);
        }
    }
    async logBatch(entries) {
        if (entries.length === 0)
            return;
        try {
            await this.prisma.auditLog.createMany({
                data: entries.map(e => ({
                    tenantId: e.tenantId, userId: e.userId,
                    action: e.action, resource: e.resource,
                    resourceId: e.resourceId, detail: e.detail ?? undefined, ip: e.ip,
                })),
            });
        }
        catch (err) {
            this.logger.error(`批量审计日志写入失败`);
        }
    }
    async query(params) {
        const { skip, take, page, pageSize } = (0, pagination_1.parsePagination)(params);
        const where = {};
        if (params.tenantId)
            where.tenantId = params.tenantId;
        if (params.userId)
            where.userId = params.userId;
        if (params.action)
            where.action = params.action;
        if (params.resource)
            where.resource = params.resource;
        const [items, total] = await Promise.all([
            this.prisma.auditLog.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
            this.prisma.auditLog.count({ where }),
        ]);
        return (0, pagination_1.paginatedResult)(items, total, page, pageSize);
    }
    async logLogin(params) {
        await this.prisma.loginLog.create({ data: params });
        await this.log({
            userId: params.userId,
            action: params.success ? 'LOGIN' : 'LOGIN_FAILED',
            resource: 'USER', resourceId: params.userId,
            detail: { method: params.method, device: params.device },
            ip: params.ip,
        });
    }
    async getLoginLogs(userId, query) {
        const { skip, take, page, pageSize } = (0, pagination_1.parsePagination)(query);
        const [items, total] = await Promise.all([
            this.prisma.loginLog.findMany({
                where: { userId }, skip, take, orderBy: { createdAt: 'desc' },
            }),
            this.prisma.loginLog.count({ where: { userId } }),
        ]);
        return (0, pagination_1.paginatedResult)(items, total, page, pageSize);
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map