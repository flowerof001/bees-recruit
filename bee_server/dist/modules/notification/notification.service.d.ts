import { PrismaService } from '../../prisma/prisma.service';
export declare class NotificationService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        userId: string;
        type: string;
        title: string;
        content: string;
        linkUrl?: string;
    }): Promise<{
        type: string;
        id: string;
        userId: string;
        createdAt: Date;
        title: string;
        content: string;
        isRead: boolean;
        linkUrl: string | null;
    }>;
    getByUser(userId: string, query: any): Promise<import("../../common/helpers/pagination").PaginatedResult<{
        type: string;
        id: string;
        userId: string;
        createdAt: Date;
        title: string;
        content: string;
        isRead: boolean;
        linkUrl: string | null;
    }>>;
    markAsRead(id: string, userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getUnreadCount(userId: string): Promise<number>;
    batchCreate(notifications: {
        userId: string;
        type: string;
        title: string;
        content: string;
        linkUrl?: string;
    }[]): Promise<void>;
}
