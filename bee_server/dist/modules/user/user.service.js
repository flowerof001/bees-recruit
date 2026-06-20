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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const sms_service_1 = require("../sms/sms.service");
const audit_service_1 = require("../audit/audit.service");
let UserService = class UserService {
    constructor(prisma, smsService, auditService) {
        this.prisma = prisma;
        this.smsService = smsService;
        this.auditService = auditService;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, phone: true, email: true,
                nickname: true, avatar: true, role: true, status: true,
                createdAt: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('用户不存在');
        return user;
    }
    async updateProfile(userId, data) {
        const user = await this.prisma.user.update({ where: { id: userId }, data });
        await this.auditService.log({
            userId, action: 'UPDATE', resource: 'USER',
            resourceId: userId, detail: data,
        });
        return user;
    }
    async getUserById(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, nickname: true, avatar: true, role: true },
        });
        if (!user)
            throw new common_1.NotFoundException('用户不存在');
        return user;
    }
    async bindPhone(userId, phone, code) {
        const valid = await this.smsService.verifyCode(phone, code);
        if (!valid)
            throw new common_1.BadRequestException('验证码错误');
        const existing = await this.prisma.user.findUnique({ where: { phone } });
        if (existing && existing.id !== userId)
            throw new common_1.ConflictException('该手机号已被绑定');
        return this.prisma.user.update({
            where: { id: userId },
            data: { phone },
            select: { id: true, phone: true },
        });
    }
    async bindEmail(userId, email) {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing && existing.id !== userId)
            throw new common_1.ConflictException('该邮箱已被绑定');
        return this.prisma.user.update({
            where: { id: userId },
            data: { email },
            select: { id: true, email: true },
        });
    }
    async setPassword(userId, oldPassword, newPassword) {
        const bcrypt = require('bcryptjs');
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
        if (!user)
            throw new common_1.NotFoundException('用户不存在');
        if (user.passwordHash) {
            const valid = await bcrypt.compare(oldPassword, user.passwordHash);
            if (!valid)
                throw new common_1.BadRequestException('原密码错误');
        }
        const hash = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
        await this.auditService.log({
            userId, action: 'UPDATE', resource: 'USER',
            resourceId: userId, detail: { field: 'password' },
        });
        return { success: true };
    }
    async deleteAccount(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('用户不存在');
        if (user.status === 'DELETED')
            throw new common_1.BadRequestException('账号已注销');
        await this.prisma.$transaction([
            this.prisma.resume.deleteMany({ where: { userId } }),
            this.prisma.application.updateMany({ where: { userId }, data: { status: 'WITHDRAWN' } }),
            this.prisma.notification.deleteMany({ where: { userId } }),
            this.prisma.deviceSession.deleteMany({ where: { userId } }),
            this.prisma.passwordReset.deleteMany({ where: { userId } }),
            this.prisma.user.update({
                where: { id: userId },
                data: {
                    status: 'DELETED',
                    phone: null,
                    email: null,
                    nickname: `已注销_${userId.slice(0, 8)}`,
                    avatar: null,
                },
            }),
        ]);
        await this.auditService.log({
            userId, action: 'DELETE', resource: 'USER',
            resourceId: userId, detail: { method: 'SELF_DELETE' },
        });
        return { success: true, message: '账号已注销' };
    }
    async getUserStats(userId) {
        const [applicationCount, resumeCount, interviewCount] = await Promise.all([
            this.prisma.application.count({ where: { userId } }),
            this.prisma.resume.count({ where: { userId } }),
            this.prisma.application.count({
                where: { userId, status: 'INTERVIEW' },
            }),
        ]);
        return { applicationCount, resumeCount, interviewCount };
    }
    async getApplications(userId, query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const skip = (page - 1) * pageSize;
        const where = { userId };
        if (query.status)
            where.status = query.status;
        const [items, total] = await Promise.all([
            this.prisma.application.findMany({
                where, skip, take: pageSize, orderBy: { createdAt: 'desc' },
                include: {
                    job: {
                        select: { id: true, title: true, location: true, salaryMin: true, salaryMax: true },
                    },
                    resume: { select: { id: true, name: true } },
                },
            }),
            this.prisma.application.count({ where }),
        ]);
        return { items, total, page, pageSize };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sms_service_1.SmsService,
        audit_service_1.AuditService])
], UserService);
//# sourceMappingURL=user.service.js.map