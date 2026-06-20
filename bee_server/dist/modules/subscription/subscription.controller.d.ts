import { SubscriptionService } from './subscription.service';
export declare class SubscriptionController {
    private subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    getPlans(): Promise<{
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
    }[]>;
    getPlan(id: string): Promise<{
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
    }>;
    subscribe(body: {
        planId: string;
    }, tenantId: string): Promise<{
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
    }>;
    getCurrent(tenantId: string): Promise<{
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
    }>;
    getHistory(tenantId: string): Promise<({
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
    })[]>;
}
