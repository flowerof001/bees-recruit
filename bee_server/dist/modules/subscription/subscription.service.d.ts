import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
export declare class SubscriptionService {
    private prisma;
    private notificationService;
    constructor(prisma: PrismaService, notificationService: NotificationService);
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
    getPlan(planId: string): Promise<{
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
    subscribe(tenantId: string, planId: string): Promise<{
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
    activateSubscription(tenantId: string, planId: string): Promise<{
        tenant: {
            name: string;
        };
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
    renew(tenantId: string): Promise<{
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
    getCurrentSubscription(tenantId: string): Promise<{
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
    getSubscriptionHistory(tenantId: string): Promise<({
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
    canPostJob(tenantId: string): Promise<boolean>;
    canChat(tenantId: string): Promise<boolean>;
    incrementChatUsed(tenantId: string): Promise<void>;
    resetDailyChatCounts(): Promise<void>;
    checkExpiredSubscriptions(): Promise<number>;
}
