"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ChatService = class ChatService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateConversation(user1Id, user2Id) {
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
    async sendMessage(conversationId, senderId, content, type = 'TEXT') {
        const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
        if (!conv)
            throw new common_1.NotFoundException('会话不存在');
        const isUser1 = conv.user1Id === senderId;
        const message = await this.prisma.message.create({
            data: { conversationId, senderId, content, type: type },
            include: { sender: { select: { id: true, nickname: true, avatar: true } } },
        });
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
    async getConversations(userId) {
        return this.prisma.conversation.findMany({
            where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
            orderBy: { updatedAt: 'desc' },
            include: {
                user1: { select: { id: true, nickname: true, avatar: true, role: true } },
                user2: { select: { id: true, nickname: true, avatar: true, role: true } },
            },
        });
    }
    async getMessages(conversationId, page = 1, pageSize = 50) {
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
    async markAsRead(conversationId, userId) {
        const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
        if (!conv)
            return;
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
    async getUnreadCount(userId) {
        const convs = await this.prisma.conversation.findMany({
            where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
        });
        return convs.reduce((sum, c) => {
            return sum + (c.user1Id === userId ? c.unreadCount1 : c.unreadCount2);
        }, 0);
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map