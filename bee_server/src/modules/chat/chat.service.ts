import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /** 获取或创建会话 */
  async getOrCreateConversation(user1Id: string, user2Id: string) {
    // 保持 user1Id < user2Id 的排序以避免重复会话
    const [uid1, uid2] = [user1Id, user2Id].sort();

    let conv = await this.prisma.conversation.findUnique({
      where: { user1Id_user2Id: { user1Id: uid1, user2Id: uid2 } },
      include: {
        user1: { select: { id: true, nickname: true, avatar: true } },
        user2: { select: { id: true, nickname: true, avatar: true } },
      },
    });

    if (!conv) {
      conv = await this.prisma.conversation.create({
        data: { user1Id: uid1, user2Id: uid2 },
        include: {
          user1: { select: { id: true, nickname: true, avatar: true } },
          user2: { select: { id: true, nickname: true, avatar: true } },
        },
      });
    }

    return conv;
  }

  /** 发送消息 */
  async sendMessage(conversationId: string, senderId: string, content: string, type: string = 'TEXT') {
    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) throw new NotFoundException('会话不存在');

    const isUser1 = conv.user1Id === senderId;

    const message = await this.prisma.message.create({
      data: { conversationId, senderId, content, type: type as any },
      include: { sender: { select: { id: true, nickname: true, avatar: true } } },
    });

    // 更新会话
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content.slice(0, 100),
        lastSentAt: new Date(),
        unreadCount1: isUser1 ? conv.unreadCount1 : { increment: 1 },
        unreadCount2: isUser1 ? { increment: 1 } : conv.unreadCount2,
      },
    });

    return message;
  }

  /** 获取会话列表 */
  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      orderBy: { updatedAt: 'desc' },
      include: {
        user1: { select: { id: true, nickname: true, avatar: true, role: true } },
        user2: { select: { id: true, nickname: true, avatar: true, role: true } },
      },
    });
  }

  /** 获取消息历史 */
  async getMessages(conversationId: string, page: number = 1, pageSize: number = 50) {
    const [items, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { sender: { select: { id: true, nickname: true, avatar: true } } },
      }),
      this.prisma.message.count({ where: { conversationId } }),
    ]);

    return { items: items.reverse(), total, page, pageSize };
  }

  /** 标记已读 */
  async markAsRead(conversationId: string, userId: string) {
    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) return;

    const isUser1 = conv.user1Id === userId;
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        unreadCount1: isUser1 ? 0 : conv.unreadCount1,
        unreadCount2: isUser1 ? conv.unreadCount2 : 0,
      },
    });

    await this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, isRead: false },
      data: { isRead: true },
    });
  }

  /** 获取未读总数 */
  async getUnreadCount(userId: string) {
    const convs = await this.prisma.conversation.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    });
    return convs.reduce((sum, c) => {
      return sum + (c.user1Id === userId ? c.unreadCount1 : c.unreadCount2);
    }, 0);
  }
}
