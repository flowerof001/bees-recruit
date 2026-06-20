import { ApplicationService } from './application.service';
import { ApplyJobDto, UpdateApplicationDto } from './dto/application.dto';
declare class BatchUpdateDto {
    ids: string[];
    status: string;
}
export declare class ApplicationController {
    private applicationService;
    constructor(applicationService: ApplicationService);
    apply(dto: ApplyJobDto, userId: string, jobId: string): Promise<{
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
    getMine(userId: string, query: any): Promise<import("../../common/helpers/pagination").PaginatedResult<{
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
    getByJob(jobId: string, query: any, tenantId: string): Promise<import("../../common/helpers/pagination").PaginatedResult<{
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
    updateStatus(id: string, dto: UpdateApplicationDto, tenantId: string, operatorId: string): Promise<{
        message: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        jobId: string;
        resumeId: string;
    }>;
    batchUpdate(dto: BatchUpdateDto, tenantId: string): Promise<{
        success: boolean;
        updated: number;
    }>;
}
export {};
