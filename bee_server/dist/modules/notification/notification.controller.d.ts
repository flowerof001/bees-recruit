import { NotificationService } from './notification.service';
export declare class NotificationController {
    private notificationService;
    constructor(notificationService: NotificationService);
    list(userId: string, query: any): Promise<import("../../common/helpers/pagination").PaginatedResult<{
        type: string;
        id: string;
        userId: string;
        createdAt: Date;
        title: string;
        content: string;
        isRead: boolean;
        linkUrl: string | null;
    }>>;
    unreadCount(userId: string): Promise<{
        count: number;
    }>;
    markRead(id: string, userId: string): Promise<{
        success: boolean;
    }>;
    markAllRead(userId: string): Promise<{
        success: boolean;
    }>;
}
