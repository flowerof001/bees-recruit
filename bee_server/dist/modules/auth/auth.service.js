"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcryptjs"));
const uuid_1 = require("uuid");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_service_1 = require("../../common/cache/redis.service");
const sms_service_1 = require("../sms/sms.service");
const audit_service_1 = require("../audit/audit.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, configService, redisService, smsService, auditService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.redisService = redisService;
        this.smsService = smsService;
        this.auditService = auditService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async sendSmsCode(phone) {
        const canSend = await this.smsService.canSend(phone);
        if (!canSend)
            throw new common_1.BadRequestException('发送过于频繁，请稍后再试');
        await this.smsService.sendCode(phone);
    }
    async loginByPhone(phone, code, meta) {
        const valid = await this.smsService.verifyCode(phone, code);
        if (!valid)
            throw new common_1.UnauthorizedException('验证码错误或已过期');
        let user = await this.prisma.user.findUnique({ where: { phone } });
        if (!user) {
            user = await this.prisma.user.create({
                data: { phone, nickname: `用户${phone.slice(-4)}`, role: 'JOB_SEEKER' },
            });
        }
        if (user.status === 'BANNED')
            throw new common_1.UnauthorizedException('账号已被禁用');
        await this.auditService.logLogin({
            userId: user.id, method: 'PHONE', ip: meta?.ip,
            userAgent: meta?.userAgent, device: meta?.device, success: true,
        });
        return this.issueTokens(user, meta?.device);
    }
    async registerByPhone(dto) {
        const valid = await this.smsService.verifyCode(dto.phone, dto.code);
        if (!valid)
            throw new common_1.UnauthorizedException('验证码错误');
        const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
        if (existing)
            throw new common_1.ConflictException('该手机号已注册');
        const data = {
            phone: dto.phone,
            nickname: dto.nickname ?? `用户${dto.phone.slice(-4)}`,
            role: dto.role,
        };
        if (dto.password) {
            data.passwordHash = await bcrypt.hash(dto.password, 10);
        }
        const user = await this.prisma.user.create({ data });
        await this.auditService.log({
            userId: user.id, action: 'CREATE', resource: 'USER',
            resourceId: user.id, detail: { method: 'PHONE' },
        });
        return this.issueTokens(user);
    }
    async loginByPassword(login, password, meta) {
        const user = await this.prisma.user.findFirst({
            where: { OR: [{ phone: login }, { email: login }] },
        });
        if (!user)
            throw new common_1.UnauthorizedException('账号不存在');
        if (user.status === 'BANNED')
            throw new common_1.UnauthorizedException('账号已被禁用');
        if (!user.passwordHash)
            throw new common_1.UnauthorizedException('该账号未设置密码，请使用验证码登录');
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            await this.auditService.logLogin({
                userId: user.id, method: 'PASSWORD', ip: meta?.ip,
                userAgent: meta?.userAgent, device: meta?.device,
                success: false, failReason: '密码错误',
            });
            throw new common_1.UnauthorizedException('密码错误');
        }
        await this.auditService.logLogin({
            userId: user.id, method: 'PASSWORD', ip: meta?.ip,
            userAgent: meta?.userAgent, device: meta?.device, success: true,
        });
        return this.issueTokens(user, meta?.device);
    }
    async setPassword(userId, newPassword) {
        if (newPassword.length < 6)
            throw new common_1.BadRequestException('密码至少 6 位');
        const hash = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
        await this.auditService.log({
            userId, action: 'UPDATE', resource: 'USER',
            resourceId: userId, detail: { field: 'password' },
        });
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.passwordHash)
            throw new common_1.BadRequestException('未设置密码');
        const valid = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('原密码错误');
        return this.setPassword(userId, newPassword);
    }
    async requestPasswordReset(target, method) {
        const user = method === 'PHONE'
            ? await this.prisma.user.findUnique({ where: { phone: target } })
            : await this.prisma.user.findUnique({ where: { email: target } });
        if (!user)
            return { message: '如果账号存在，重置链接已发送' };
        const token = (0, uuid_1.v4)();
        await this.prisma.passwordReset.create({
            data: {
                userId: user.id, token, method,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            },
        });
        if (method === 'PHONE') {
            await this.smsService.sendNotification(target, 'PASSWORD_RESET', { token });
        }
        else {
            this.logger.log(`密码重置 Token → ${target}: ${token}`);
        }
        return { message: '重置链接已发送' };
    }
    async resetPassword(token, newPassword) {
        const reset = await this.prisma.passwordReset.findUnique({ where: { token } });
        if (!reset || reset.used || new Date() > reset.expiresAt) {
            throw new common_1.BadRequestException('重置链接无效或已过期');
        }
        await this.setPassword(reset.userId, newPassword);
        await this.prisma.passwordReset.update({ where: { token }, data: { used: true } });
        return { message: '密码重置成功' };
    }
    async loginByWechat(code, meta) {
        const mockOpenId = `wx_${code.slice(0, 10)}_${(0, uuid_1.v4)().slice(0, 6)}`;
        let user = await this.prisma.user.findUnique({ where: { wechatOpenId: mockOpenId } });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    wechatOpenId: mockOpenId,
                    nickname: `微信用户${(0, uuid_1.v4)().slice(0, 4)}`,
                    role: 'JOB_SEEKER',
                },
            });
        }
        if (user.status === 'BANNED')
            throw new common_1.UnauthorizedException('账号已被禁用');
        await this.auditService.logLogin({
            userId: user.id, method: 'WECHAT', ip: meta?.ip,
            userAgent: meta?.userAgent, device: meta?.device, success: true,
        });
        return this.issueTokens(user, meta?.device);
    }
    async bindWechatPhone(userId, wechatPhoneCode) {
        const mockPhone = wechatPhoneCode.startsWith('mock_') ? wechatPhoneCode.replace('mock_', '') : null;
        if (!mockPhone)
            throw new common_1.BadRequestException('获取手机号失败');
        const existing = await this.prisma.user.findUnique({ where: { phone: mockPhone } });
        if (existing && existing.id !== userId) {
            throw new common_1.ConflictException('该手机号已被其他账号绑定');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { phone: mockPhone },
        });
    }
    async bindEmail(userId, email) {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing)
            throw new common_1.ConflictException('该邮箱已被绑定');
        await this.prisma.user.update({ where: { id: userId }, data: { email } });
        await this.auditService.log({
            userId, action: 'UPDATE', resource: 'USER',
            resourceId: userId, detail: { field: 'email', value: email },
        });
    }
    async getDevices(userId) {
        return this.prisma.deviceSession.findMany({
            where: { userId, expiresAt: { gt: new Date() } },
            orderBy: { lastActiveAt: 'desc' },
        });
    }
    async revokeDevice(userId, deviceId) {
        await this.prisma.deviceSession.deleteMany({
            where: { userId, deviceId },
        });
        await this.redisService.del(`refresh:${deviceId}`);
    }
    async revokeAllDevices(userId) {
        const devices = await this.prisma.deviceSession.findMany({
            where: { userId }, select: { deviceId: true },
        });
        for (const d of devices) {
            await this.redisService.del(`refresh:${d.deviceId}`);
        }
        await this.prisma.deviceSession.deleteMany({ where: { userId } });
    }
    async adminLogin(username, password, meta) {
        const admin = await this.prisma.admin.findUnique({ where: { username } });
        if (!admin)
            throw new common_1.UnauthorizedException('管理员不存在');
        const valid = await bcrypt.compare(password, admin.passwordHash);
        if (!valid) {
            await this.auditService.log({
                userId: admin.id, action: 'LOGIN_FAILED', resource: 'ADMIN',
                detail: { reason: '密码错误' }, ip: meta?.ip,
            });
            throw new common_1.UnauthorizedException('密码错误');
        }
        await this.auditService.logLogin({
            userId: admin.id, method: 'ADMIN', ip: meta?.ip,
            userAgent: meta?.userAgent, success: true,
        });
        const payload = { sub: admin.id, username: admin.username, role: 'ADMIN', adminRole: admin.role };
        return {
            accessToken: this.jwtService.sign(payload, { expiresIn: '12h' }),
            user: admin,
        };
    }
    async getLoginLogs(userId, query) {
        return this.auditService.getLoginLogs(userId, query);
    }
    async logout(token) {
        try {
            const decoded = this.jwtService.decode(token);
            if (decoded?.exp) {
                const ttl = decoded.exp - Math.floor(Date.now() / 1000);
                if (ttl > 0) {
                    await this.redisService.sadd('jwt:blacklist', token);
                    await this.redisService.set(`blacklist:ttl:${token}`, '1', ttl);
                }
            }
        }
        catch { }
        await this.auditService.log({
            userId: this.jwtService.decode(token)?.sub,
            action: 'LOGOUT', resource: 'USER',
        });
    }
    async isTokenBlacklisted(token) {
        return this.redisService.sismember('jwt:blacklist', token);
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
            if (!user || user.status === 'BANNED')
                throw new common_1.UnauthorizedException();
            return this.issueTokens(user);
        }
        catch {
            throw new common_1.UnauthorizedException('Token 无效或已过期');
        }
    }
    async issueTokens(user, device) {
        const payload = { sub: user.id, phone: user.phone, role: user.role };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
        if (device) {
            const deviceId = (0, uuid_1.v4)();
            await this.redisService.set(`refresh:${deviceId}`, refreshToken, 30 * 86400);
            await this.prisma.deviceSession.upsert({
                where: { deviceId },
                create: {
                    userId: user.id, deviceId, deviceName: device,
                    refreshToken, expiresAt: new Date(Date.now() + 30 * 86400000),
                },
                update: {
                    refreshToken, lastActiveAt: new Date(),
                    expiresAt: new Date(Date.now() + 30 * 86400000),
                },
            });
        }
        const safeUser = {
            id: user.id, phone: user.phone, email: user.email,
            nickname: user.nickname, avatar: user.avatar, role: user.role,
        };
        return { accessToken, refreshToken, user: safeUser };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        redis_service_1.RedisService,
        sms_service_1.SmsService,
        audit_service_1.AuditService])
], AuthService);
//# sourceMappingURL=auth.service.js.map