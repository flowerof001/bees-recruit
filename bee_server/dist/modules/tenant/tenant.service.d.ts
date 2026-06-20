import { PrismaService } from '../../prisma/prisma.service';
export declare class TenantService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: {
        name: string;
        description?: string;
        industry?: string;
        ownerId: string;
    }): Promise<{
        members: {
            id: string;
            tenantId: string;
            userId: string;
            role: import("@prisma/client").$Enums.MemberRole;
            joinedAt: Date;
        }[];
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
    }>;
    getMyTenant(userId: string): Promise<{
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
    getTenantById(tenantId: string): Promise<{
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
    }>;
    addMember(tenantId: string, userId: string, role?: string): Promise<{
        id: string;
        tenantId: string;
        userId: string;
        role: import("@prisma/client").$Enums.MemberRole;
        joinedAt: Date;
    }>;
    removeMember(tenantId: string, userId: string): Promise<{
        id: string;
        tenantId: string;
        userId: string;
        role: import("@prisma/client").$Enums.MemberRole;
        joinedAt: Date;
    }>;
    private generateSlug;
}
