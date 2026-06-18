import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('通知')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: '通知列表' })
  async list(@CurrentUser('id') userId: string, @Query() query: any) {
    return this.notificationService.getByUser(userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: '未读通知数' })
  async unreadCount(@CurrentUser('id') userId: string) {
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Post(':id/read')
  @ApiOperation({ summary: '标记已读' })
  async markRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.notificationService.markAsRead(id, userId);
    return { success: true };
  }

  @Post('read-all')
  @ApiOperation({ summary: '全部已读' })
  async markAllRead(@CurrentUser('id') userId: string) {
    await this.notificationService.markAllAsRead(userId);
    return { success: true };
  }
}
