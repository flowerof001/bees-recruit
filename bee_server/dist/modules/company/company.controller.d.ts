import { CompanyService } from './company.service';
export declare class CompanyController {
    private companyService;
    constructor(companyService: CompanyService);
    search(query: any): Promise<{
        items: {
            id: string;
            name: string;
            _count: {
                jobs: number;
            };
            description: string;
            industry: string;
            logo: string;
            scale: string;
            verified: boolean;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getMyTenant(userId: string): Promise<{
        myRole: import("@prisma/client").$Enums.MemberRole;
        jobCount: number;
        memberCount: number;
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
    getMyTenantBrief(userId: string): Promise<{
        id: string;
        name: string;
        logo: string;
        verified: boolean;
        myRole: import("@prisma/client").$Enums.MemberRole;
        newApplications: number;
    }>;
    create(userId: string, body: any): Promise<{
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
    getPublicProfile(id: string): Promise<{
        jobCount: number;
        openJobs: {
            id: string;
            createdAt: Date;
            title: string;
            tags: string[];
            location: string;
            salaryMin: number;
            salaryMax: number;
        }[];
        id: string;
        createdAt: Date;
        name: string;
        description: string;
        industry: string;
        logo: string;
        scale: string;
        verified: boolean;
    }>;
    updateProfile(id: string, userId: string, body: any): Promise<{
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
    join(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    leave(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getMembers(id: string, userId: string): Promise<({
        user: {
            id: string;
            phone: string;
            nickname: string;
            avatar: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        tenantId: string;
        userId: string;
        role: import("@prisma/client").$Enums.MemberRole;
        joinedAt: Date;
    })[]>;
    removeMember(id: string, targetUserId: string, operatorId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updateMemberRole(id: string, targetUserId: string, operatorId: string, body: {
        role: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
