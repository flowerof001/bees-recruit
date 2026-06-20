import { AdminService } from './admin.service';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    dashboard(): Promise<{
        totals: {
            tenants: number;
            users: number;
            openJobs: number;
            applications: number;
        };
        applications: {
            today: number;
            yesterday: number;
            thisWeek: number;
            thisMonth: number;
            daily: {
                date: string;
                count: number;
            }[];
        };
        subscriptions: {
            active: number;
            trial: number;
            expired: number;
            conversionRate: number;
        };
        revenue: {
            total: number;
            thisMonth: number;
            paidOrders: number;
        };
    }>;
    getTenants(query: any): Promise<import("../../common/helpers/pagination").PaginatedResult<{
        subscription: {
            plan: {
                id: string;
                createdAt: Date;
                name: string;
                nameCN: string;
                priceMonthly: number;
                priceYearly: number;
                maxJobs: number;
                maxRecruiters: number;
                maxChatsPerDay: number;
                features: string[];
                recommended: boolean;
                isActive: boolean;
            };
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            status: string;
            updatedAt: Date;
            platformId: string;
            startDate: Date;
            endDate: Date | null;
            autoRenew: boolean;
            jobPostsUsed: number;
            chatsUsed: number;
            planId: string;
        };
        _count: {
            jobs: number;
            members: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        status: import("@prisma/client").$Enums.TenantStatus;
        updatedAt: Date;
        description: string | null;
        industry: string | null;
        slug: string;
        logo: string | null;
        scale: string | null;
        verified: boolean;
        platformId: string;
    }>>;
    getTenant(id: string): Promise<{
        stats: {
            totalJobs: number;
            totalApplications: number;
        };
        subscription: {
            plan: {
                id: string;
                createdAt: Date;
                name: string;
                nameCN: string;
                priceMonthly: number;
                priceYearly: number;
                maxJobs: number;
                maxRecruiters: number;
                maxChatsPerDay: number;
                features: string[];
                recommended: boolean;
                isActive: boolean;
            };
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            status: string;
            updatedAt: Date;
            platformId: string;
            startDate: Date;
            endDate: Date | null;
            autoRenew: boolean;
            jobPostsUsed: number;
            chatsUsed: number;
            planId: string;
        };
        payments: {
            method: string;
            id: string;
            tenantId: string;
            userId: string;
            createdAt: Date;
            status: string;
            amount: number;
            currency: string;
            orderNo: string;
            transactionId: string | null;
            paidAt: Date | null;
            subscriptionId: string | null;
        }[];
        _count: {
            jobs: number;
            members: number;
        };
        members: ({
            user: {
                id: string;
                phone: string;
                nickname: string;
                avatar: string;
            };
        } & {
            id: string;
            tenantId: string;
            userId: string;
            role: import("@prisma/client").$Enums.MemberRole;
            joinedAt: Date;
        })[];
        id: string;
        createdAt: Date;
        name: string;
        status: import("@prisma/client").$Enums.TenantStatus;
        updatedAt: Date;
        description: string | null;
        industry: string | null;
        slug: string;
        logo: string | null;
        scale: string | null;
        verified: boolean;
        platformId: string;
    }>;
    updateTenantStatus(id: string, body: {
        status: string;
    }, adminId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        status: import("@prisma/client").$Enums.TenantStatus;
        updatedAt: Date;
        description: string | null;
        industry: string | null;
        slug: string;
        logo: string | null;
        scale: string | null;
        verified: boolean;
        platformId: string;
    }>;
    verifyTenant(id: string, adminId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        status: import("@prisma/client").$Enums.TenantStatus;
        updatedAt: Date;
        description: string | null;
        industry: string | null;
        slug: string;
        logo: string | null;
        scale: string | null;
        verified: boolean;
        platformId: string;
    }>;
    exportTenants(): Promise<({
        subscription: {
            plan: {
                id: string;
                createdAt: Date;
                name: string;
                nameCN: string;
                priceMonthly: number;
                priceYearly: number;
                maxJobs: number;
                maxRecruiters: number;
                maxChatsPerDay: number;
                features: string[];
                recommended: boolean;
                isActive: boolean;
            };
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            status: string;
            updatedAt: Date;
            platformId: string;
            startDate: Date;
            endDate: Date | null;
            autoRenew: boolean;
            jobPostsUsed: number;
            chatsUsed: number;
            planId: string;
        };
        _count: {
            jobs: number;
            members: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        status: import("@prisma/client").$Enums.TenantStatus;
        updatedAt: Date;
        description: string | null;
        industry: string | null;
        slug: string;
        logo: string | null;
        scale: string | null;
        verified: boolean;
        platformId: string;
    })[]>;
    getUsers(query: any): Promise<import("../../common/helpers/pagination").PaginatedResult<{
        id: string;
        createdAt: Date;
        phone: string;
        email: string;
        nickname: string;
        avatar: string;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        _count: {
            resumes: number;
            applications: number;
        };
    }>>;
    getUser(id: string): Promise<{
        loginLogs: {
            method: string;
            ip: string | null;
            id: string;
            userId: string;
            createdAt: Date;
            userAgent: string | null;
            device: string | null;
            success: boolean;
            failReason: string | null;
        }[];
        tenantMembers: ({
            tenant: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            tenantId: string;
            userId: string;
            role: import("@prisma/client").$Enums.MemberRole;
            joinedAt: Date;
        })[];
        resumes: {
            id: string;
            userId: string;
            createdAt: Date;
            name: string;
            phone: string;
            email: string | null;
            avatar: string | null;
            updatedAt: Date;
            title: string | null;
            summary: string | null;
            gender: string | null;
            birthYear: number | null;
            education: import("@prisma/client/runtime/client").JsonValue | null;
            experience: import("@prisma/client/runtime/client").JsonValue | null;
            skills: string[];
            workYears: number | null;
            salaryExpect: import("@prisma/client/runtime/client").JsonValue | null;
            jobStatus: string | null;
            isDefault: boolean;
        }[];
        _count: {
            applications: number;
        };
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
    updateUserStatus(id: string, body: {
        status: string;
    }, adminId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.UserStatus;
    }>;
    exportUsers(): Promise<{
        id: string;
        createdAt: Date;
        phone: string;
        email: string;
        nickname: string;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
    }[]>;
    getPayments(query: any): Promise<import("../../common/helpers/pagination").PaginatedResult<{
        tenant: {
            name: string;
        };
        user: {
            nickname: string;
        };
    } & {
        method: string;
        id: string;
        tenantId: string;
        userId: string;
        createdAt: Date;
        status: string;
        amount: number;
        currency: string;
        orderNo: string;
        transactionId: string | null;
        paidAt: Date | null;
        subscriptionId: string | null;
    }>>;
    getAuditLogs(query: any): Promise<import("../../common/helpers/pagination").PaginatedResult<{
        ip: string | null;
        id: string;
        tenantId: string | null;
        userId: string | null;
        action: string;
        resource: string;
        resourceId: string | null;
        detail: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
    }>>;
    getLoginLogs(query: any): Promise<import("../../common/helpers/pagination").PaginatedResult<{
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
    getConfigs(): Promise<{
        key: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        description: string | null;
        updatedBy: string | null;
    }[]>;
    getConfig(key: string): Promise<{
        key: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        description: string | null;
        updatedBy: string | null;
    }>;
    setConfig(key: string, body: {
        value: string;
        description?: string;
    }, adminId: string): Promise<{
        key: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        description: string | null;
        updatedBy: string | null;
    }>;
    deleteConfig(key: string): Promise<void>;
}
