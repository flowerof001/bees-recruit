import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';
import { AuditService } from '../audit/audit.service';
export declare class UserService {
    private prisma;
    private smsService;
    private auditService;
    constructor(prisma: PrismaService, smsService: SmsService, auditService: AuditService);
    getProfile(userId: string): Promise<{
        id: string;
        createdAt: Date;
        phone: string;
        email: string;
        nickname: string;
        avatar: string;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
    }>;
    updateProfile(userId: string, data: {
        nickname?: string;
        avatar?: string;
        email?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        phone: string | null;
        email: string | null;
        wechatOpenId: string | null;
        wechatUnionId: string | null;
        passwordHash: string | null;
        nickname: string | null;
        avatar: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        updatedAt: Date;
    }>;
    getUserById(userId: string): Promise<{
        id: string;
        nickname: string;
        avatar: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    bindPhone(userId: string, phone: string, code: string): Promise<{
        id: string;
        phone: string;
    }>;
    bindEmail(userId: string, email: string): Promise<{
        id: string;
        email: string;
    }>;
    setPassword(userId: string, oldPassword: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    deleteAccount(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserStats(userId: string): Promise<{
        applicationCount: number;
        resumeCount: number;
        interviewCount: number;
    }>;
    getApplications(userId: string, query: {
        page?: number;
        pageSize?: number;
        status?: string;
    }): Promise<{
        items: ({
            resume: {
                id: string;
                name: string;
            };
            job: {
                id: string;
                title: string;
                location: string;
                salaryMin: number;
                salaryMax: number;
            };
        } & {
            message: string | null;
            id: string;
            userId: string;
            createdAt: Date;
            status: string;
            updatedAt: Date;
            jobId: string;
            resumeId: string;
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
}
