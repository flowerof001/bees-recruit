import { TenantService } from './tenant.service';
import { CreateTenantDto } from '../auth/dto/auth.dto';
export declare class TenantController {
    private tenantService;
    constructor(tenantService: TenantService);
    create(dto: CreateTenantDto, userId: string): Promise<{
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
    getMine(userId: string): Promise<{
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
    getById(id: string): Promise<{
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
    addMember(id: string, body: {
        userId: string;
        role?: string;
    }): Promise<{
        id: string;
        tenantId: string;
        userId: string;
        role: import("@prisma/client").$Enums.MemberRole;
        joinedAt: Date;
    }>;
    removeMember(id: string, userId: string): Promise<{
        id: string;
        tenantId: string;
        userId: string;
        role: import("@prisma/client").$Enums.MemberRole;
        joinedAt: Date;
    }>;
}
