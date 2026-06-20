import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/cache/redis.service';
import { SmsService } from '../sms/sms.service';
import { AuditService } from '../audit/audit.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private redisService;
    private smsService;
    private auditService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, redisService: RedisService, smsService: SmsService, auditService: AuditService);
    sendSmsCode(phone: string): Promise<void>;
    loginByPhone(phone: string, code: string, meta?: {
        ip?: string;
        userAgent?: string;
        device?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            phone: any;
            email: any;
            nickname: any;
            avatar: any;
            role: any;
        };
    }>;
    registerByPhone(dto: {
        phone: string;
        code: string;
        role: string;
        nickname?: string;
        password?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            phone: any;
            email: any;
            nickname: any;
            avatar: any;
            role: any;
        };
    }>;
    loginByPassword(login: string, password: string, meta?: {
        ip?: string;
        userAgent?: string;
        device?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            phone: any;
            email: any;
            nickname: any;
            avatar: any;
            role: any;
        };
    }>;
    setPassword(userId: string, newPassword: string): Promise<void>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
    requestPasswordReset(target: string, method: 'PHONE' | 'EMAIL'): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    loginByWechat(code: string, meta?: {
        ip?: string;
        userAgent?: string;
        device?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            phone: any;
            email: any;
            nickname: any;
            avatar: any;
            role: any;
        };
    }>;
    bindWechatPhone(userId: string, wechatPhoneCode: string): Promise<void>;
    bindEmail(userId: string, email: string): Promise<void>;
    getDevices(userId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        expiresAt: Date;
        deviceId: string;
        deviceName: string | null;
        deviceType: string | null;
        pushToken: string | null;
        refreshToken: string | null;
        lastActiveAt: Date;
    }[]>;
    revokeDevice(userId: string, deviceId: string): Promise<void>;
    revokeAllDevices(userId: string): Promise<void>;
    adminLogin(username: string, password: string, meta?: {
        ip?: string;
        userAgent?: string;
    }): Promise<{
        accessToken: string;
        user: {
            id: string;
            createdAt: Date;
            passwordHash: string;
            role: string;
            username: string;
        };
    }>;
    getLoginLogs(userId: string, query: any): Promise<import("../../common/helpers/pagination").PaginatedResult<{
        method: string;
        ip: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        userAgent: string | null;
        device: string | null;
        success: boolean;
        failReason: string | null;
    }>>;
    logout(token: string): Promise<void>;
    isTokenBlacklisted(token: string): Promise<boolean>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            phone: any;
            email: any;
            nickname: any;
            avatar: any;
            role: any;
        };
    }>;
    private issueTokens;
}
