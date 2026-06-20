import { ChatService } from './chat.service';
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
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
    createConversation(userId: string, body: {
        targetUserId: string;
    }): Promise<{
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
    getMessages(id: string, page?: number): Promise<{
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
    markRead(id: string, userId: string): Promise<{
        success: boolean;
    }>;
    getUnread(userId: string): Promise<{
        count: number;
    }>;
}
