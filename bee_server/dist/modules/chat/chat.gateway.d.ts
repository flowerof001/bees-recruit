import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
interface AuthenticatedSocket extends Socket {
    userId: string;
}
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private chatService;
    server: Server;
    private userSockets;
    constructor(chatService: ChatService);
    handleConnection(client: AuthenticatedSocket): void;
    handleDisconnect(client: AuthenticatedSocket): void;
    handleMessage(client: AuthenticatedSocket, data: {
        conversationId: string;
        content: string;
        type?: string;
    }): Promise<{
        success: boolean;
        message: {
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
        };
    }>;
    handleJoinConversation(client: AuthenticatedSocket, data: {
        conversationId: string;
    }): void;
    handleLeaveConversation(client: AuthenticatedSocket, data: {
        conversationId: string;
    }): void;
    handleRead(client: AuthenticatedSocket, data: {
        conversationId: string;
    }): Promise<void>;
    sendToUser(userId: string, event: string, data: any): void;
}
export {};
