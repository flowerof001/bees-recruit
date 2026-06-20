import { JobService } from './job.service';
import { CreateJobDto } from './dto/job.dto';
export declare class JobController {
    private jobService;
    constructor(jobService: JobService);
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
    getById(id: string): Promise<{
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
    create(dto: CreateJobDto, userId: string, tenantId: string): Promise<{
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
    getMine(tenantId: string, query: any): Promise<import("../../common/helpers/pagination").PaginatedResult<{
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
    update(id: string, dto: any, tenantId: string): Promise<{
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
    close(id: string, tenantId: string): Promise<{
        success: boolean;
    }>;
    reopen(id: string, tenantId: string): Promise<{
        success: boolean;
    }>;
}
