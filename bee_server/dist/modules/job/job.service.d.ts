import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { NotificationService } from '../notification/notification.service';
export declare class JobService {
    private prisma;
    private subscriptionService;
    private notificationService;
    constructor(prisma: PrismaService, subscriptionService: SubscriptionService, notificationService: NotificationService);
    create(tenantId: string, publisherId: string, dto: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        description: string;
        title: string;
        tags: string[];
        requirements: string | null;
        location: string | null;
        locationType: string;
        salaryMin: number | null;
        salaryMax: number | null;
        experienceMin: number | null;
        educationReq: string | null;
        headcount: number;
        viewCount: number;
        publisherId: string;
    }>;
    search(query: any): Promise<import("../../common/helpers/pagination").PaginatedResult<{
        tenant: {
            id: string;
            name: string;
            industry: string;
            logo: string;
            scale: string;
            verified: boolean;
        };
        _count: {
            applications: number;
        };
        publisher: {
            id: string;
            nickname: string;
            avatar: string;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        description: string;
        title: string;
        tags: string[];
        requirements: string | null;
        location: string | null;
        locationType: string;
        salaryMin: number | null;
        salaryMax: number | null;
        experienceMin: number | null;
        educationReq: string | null;
        headcount: number;
        viewCount: number;
        publisherId: string;
    }>>;
    getById(jobId: string): Promise<{
        tenant: {
            id: string;
            name: string;
            description: string;
            industry: string;
            logo: string;
            scale: string;
            verified: boolean;
        };
        _count: {
            applications: number;
        };
        publisher: {
            id: string;
            nickname: string;
            avatar: string;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        description: string;
        title: string;
        tags: string[];
        requirements: string | null;
        location: string | null;
        locationType: string;
        salaryMin: number | null;
        salaryMax: number | null;
        experienceMin: number | null;
        educationReq: string | null;
        headcount: number;
        viewCount: number;
        publisherId: string;
    }>;
    getByTenant(tenantId: string, query: any): Promise<import("../../common/helpers/pagination").PaginatedResult<{
        _count: {
            applications: number;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        description: string;
        title: string;
        tags: string[];
        requirements: string | null;
        location: string | null;
        locationType: string;
        salaryMin: number | null;
        salaryMax: number | null;
        experienceMin: number | null;
        educationReq: string | null;
        headcount: number;
        viewCount: number;
        publisherId: string;
    }>>;
    update(jobId: string, tenantId: string, dto: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        description: string;
        title: string;
        tags: string[];
        requirements: string | null;
        location: string | null;
        locationType: string;
        salaryMin: number | null;
        salaryMax: number | null;
        experienceMin: number | null;
        educationReq: string | null;
        headcount: number;
        viewCount: number;
        publisherId: string;
    }>;
    close(jobId: string, tenantId: string): Promise<{
        success: boolean;
    }>;
    reopen(jobId: string, tenantId: string): Promise<{
        success: boolean;
    }>;
}
