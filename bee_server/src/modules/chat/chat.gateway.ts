import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

interface AuthenticatedSocket extends Socket {
  userId: string;
}

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(private chatService: ChatService) {}

  handleConnection(client: AuthenticatedSocket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      client.disconnect();
      return;
    }
    client.userId = userId;

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);
    console.log(`[Chat] User ${userId} connected (socket ${client.id})`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.userSockets.get(client.userId)?.delete(client.id);
      console.log(`[Chat] User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; content: string; type?: string },
  ) {
    const message = await this.chatService.sendMessage(
      data.conversationId,
      client.userId,
      data.content,
      data.type || 'TEXT',
    );

    // 广播给会话所有人
    this.server.to(data.conversationId).emit('message:new', message);

    return { success: true, message };
  }

  @SubscribeMessage('conversation:join')
  handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(data.conversationId);
  }

  @SubscribeMessage('conversation:leave')
  handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(data.conversationId);
  }

  @SubscribeMessage('conversation:read')
  async handleRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    await this.chatService.markAsRead(data.conversationId, client.userId);
  }

  /** 向特定用户推送消息 */
  sendToUser(userId: string, event: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach(socketId => {
        this.server.to(socketId).emit(event, data);
      });
    }
  }
}
