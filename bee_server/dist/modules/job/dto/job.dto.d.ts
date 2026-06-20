export declare class CreateJobDto {
    title: string;
    description: string;
    requirements?: string;
    location?: string;
    locationType?: string;
    salaryMin?: number;
    salaryMax?: number;
    headcount?: number;
    tags?: string[];
    educationReq?: string;
}
export declare class SearchJobDto {
    keyword?: string;
    location?: string;
    salaryMin?: number;
    tag?: string;
    page?: number;
    pageSize?: number;
}
