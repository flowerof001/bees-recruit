import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
export declare class ApplicationService {
    private prisma;
    private notificationService;
    constructor(prisma: PrismaService, notificationService: NotificationService);
    apply(userId: string, jobId: string, resumeId: string, message?: string): Promise<{
        user: {
            id: string;
            nickname: string;
            avatar: string;
        };
        resume: {
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
    }>;
    getByJob(jobId: string, tenantId: string, query: any): Promise<import("../../common/helpers/pagination").PaginatedResult<{
        user: {
            id: string;
            nickname: string;
            avatar: string;
        };
        resume: {
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
    }>>;
    getMyApplications(userId: string, query: any): Promise<import("../../common/helpers/pagination").PaginatedResult<{
        job: {
            tenant: {
                id: string;
                name: string;
                logo: string;
            };
            id: string;
            status: string;
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
    }>>;
    updateStatus(applicationId: string, tenantId: string, status: string, operatorId: string): Promise<{
        message: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        jobId: string;
        resumeId: string;
    }>;
    batchUpdateStatus(ids: string[], tenantId: string, status: string): Promise<{
        success: boolean;
        updated: number;
    }>;
}
