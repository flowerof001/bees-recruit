import { UserService } from './user.service';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getProfile(userId: string): Promise<{
        id: string;
        createdAt: Date;
        phone: string;
        email: string;
        nickname: string;
        avatar: string;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
    }>;
    updateProfile(userId: string, body: any): Promise<{
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
    getStats(userId: string): Promise<{
        applicationCount: number;
        resumeCount: number;
        interviewCount: number;
    }>;
    getApplications(userId: string, query: any): Promise<{
        items: ({
            resume: {
                id: string;
                name: string;
            };
            job: {
                id: string;
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
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    bindPhone(userId: string, body: {
        phone: string;
        code: string;
    }): Promise<{
        id: string;
        phone: string;
    }>;
    bindEmail(userId: string, body: {
        email: string;
    }): Promise<{
        id: string;
        email: string;
    }>;
    setPassword(userId: string, body: {
        oldPassword: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
    }>;
    deleteAccount(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
