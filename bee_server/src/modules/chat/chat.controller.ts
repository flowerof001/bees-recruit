import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('聊天')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: '会话列表' })
  async getConversations(@CurrentUser('id') userId: string) {
    return this.chatService.getConversations(userId);
  }

  @Post('conversations')
  @ApiOperation({ summary: '创建/获取会话' })
  async createConversation(@CurrentUser('id') userId: string, @Body() body: { targetUserId: string }) {
    return this.chatService.getOrCreateConversation(userId, body.targetUserId);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: '消息历史' })
  async getMessages(@Param('id') id: string, @Query('page') page?: number) {
    return this.chatService.getMessages(id, page || 1);
  }

  @Post('conversations/:id/read')
  @ApiOperation({ summary: '标记已读' })
  async markRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.chatService.markAsRead(id, userId);
    return { success: true };
  }

  @Get('unread')
  @ApiOperation({ summary: '未读消息总数' })
  async getUnread(@CurrentUser('id') userId: string) {
    const count = await this.chatService.getUnreadCount(userId);
    return { count };
  }
}
