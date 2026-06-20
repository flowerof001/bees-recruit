import { PrismaService } from '../../prisma/prisma.service';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    getOrCreateConversation(user1Id: string, user2Id: string): Promise<{
        user1: {
            id: string;
            nickname: string;
            avatar: string;
        };
        user2: {
            id: string;
            nickname: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lastMessage: string | null;
        lastSentAt: Date | null;
        unreadCount1: number;
        unreadCount2: number;
        user1Id: string;
        user2Id: string;
    }>;
    sendMessage(conversationId: string, senderId: string, content: string, type?: string): Promise<{
        sender: {
            id: string;
            nickname: string;
            avatar: string;
        };
    } & {
        type: string;
        id: string;
        createdAt: Date;
        content: string;
        isRead: boolean;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        conversationId: string;
        senderId: string;
    }>;
    getConversations(userId: string): Promise<({
        user1: {
            id: string;
            nickname: string;
            avatar: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
        user2: {
            id: string;
            nickname: string;
            avatar: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lastMessage: string | null;
        lastSentAt: Date | null;
        unreadCount1: number;
        unreadCount2: number;
        user1Id: string;
        user2Id: string;
    })[]>;
    getMessages(conversationId: string, page?: number, pageSize?: number): Promise<{
        items: ({
            sender: {
                id: string;
                nickname: string;
                avatar: string;
            };
        } & {
            type: string;
            id: string;
            createdAt: Date;
            content: string;
            isRead: boolean;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            conversationId: string;
            senderId: string;
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    markAsRead(conversationId: string, userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
}
