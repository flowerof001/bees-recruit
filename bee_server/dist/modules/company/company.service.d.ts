import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class CompanyService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    getPublicProfile(tenantId: string): Promise<{
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
    updateProfile(tenantId: string, userId: string, dto: {
        name?: string;
        description?: string;
        industry?: string;
        scale?: string;
        logo?: string;
    }): Promise<{
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
    create(userId: string, dto: {
        name: string;
        slug?: string;
        description?: string;
        industry?: string;
        scale?: string;
    }): Promise<{
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
    join(tenantId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    leave(tenantId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getMembers(tenantId: string, userId: string): Promise<({
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
    removeMember(tenantId: string, operatorId: string, targetUserId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updateMemberRole(tenantId: string, operatorId: string, targetUserId: string, role: string): Promise<{
        success: boolean;
        message: string;
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
    searchCompanies(query: {
        keyword?: string;
        industry?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{
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
    getMyTenantBrief(userId: string): Promise<{
        id: string;
        name: string;
        logo: string;
        verified: boolean;
        myRole: import("@prisma/client").$Enums.MemberRole;
        newApplications: number;
    }>;
    private requireMember;
    private requireOwnerOrAdmin;
}
