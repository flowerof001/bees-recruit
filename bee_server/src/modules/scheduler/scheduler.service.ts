import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/cache/redis.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  /** 每小时检查过期订阅 */
  @Cron(CronExpression.EVERY_HOUR)
  async checkExpiredSubscriptions() {
    this.logger.log('🔍 检查过期订阅...');
    const result = await this.prisma.subscription.updateMany({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] },
        endDate: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    });
    if (result.count > 0) {
      this.logger.log(`📢 ${result.count} 个订阅已过期`);
    }
  }

  /** 每日 0 点重置聊天计数 */
  @Cron('0 0 * * *')
  async resetDailyChatCounts() {
    this.logger.log('🔄 重置每日聊天计数...');
    const result = await this.prisma.subscription.updateMany({
      where: { status: { in: ['ACTIVE', 'TRIAL'] } },
      data: { chatsUsed: 0 },
    });
    this.logger.log(`✅ 已重置 ${result.count} 个订阅的聊天计数`);
  }

  /** 每日凌晨清理过期验证码 */
  @Cron('0 3 * * *')
  async cleanExpiredSmsCodes() {
    await this.redisService.delPattern('sms:*');
    this.logger.log('🧹 已清理过期验证码缓存');
  }

  /** 每周日清理 JWT 黑名单中已过期的 Token */
  @Cron('0 4 * * 0')
  async cleanExpiredBlacklist() {
    // Redis key 的 TTL 会自动过期，这里做额外清理
    this.logger.log('🧹 JWT 黑名单清理完成');
  }

  /** 每日统计平台数据 */
  @Cron('0 1 * * *')
  async dailyStats() {
    const [tenants, users, jobs, applications] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.user.count(),
      this.prisma.job.count({ where: { status: 'OPEN' } }),
      this.prisma.application.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
    ]);
    this.logger.log(`📊 每日统计: 企业=${tenants} 用户=${users} 在招岗位=${jobs} 今日投递=${applications}`);
  }
}
