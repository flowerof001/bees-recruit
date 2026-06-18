import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { parsePagination, paginatedResult } from '../../common/helpers/pagination';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(data: { userId: string; type: string; title: string; content: string; linkUrl?: string }) {
    return this.prisma.notification.create({ data });
  }

  async getByUser(userId: string, query: any) {
    const { skip, take, page, pageSize } = parsePagination(query);
    const where: any = { userId };

    if (query.type) where.type = query.type;
    if (query.isRead !== undefined) where.isRead = query.isRead === 'true';

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return paginatedResult(items, total, page, pageSize);
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }

  /** 批量创建通知 */
  async batchCreate(notifications: { userId: string; type: string; title: string; content: string; linkUrl?: string }[]) {
    if (notifications.length === 0) return;
    await this.prisma.notification.createMany({ data: notifications });
  }
}
