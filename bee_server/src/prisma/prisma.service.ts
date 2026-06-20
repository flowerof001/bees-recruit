import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({ log: ['error', 'warn'] });
  }

  async onModuleInit() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      this.logger.warn('⚠️ DATABASE_URL 未设置，跳过数据库连接。请在 Render 环境变量中配置后重新部署。');
      return;
    }

    try {
      await this.$connect();
      this.logger.log('📦 Prisma 已连接 PostgreSQL');
    } catch (err) {
      this.logger.error('❌ 数据库连接失败，服务将以降级模式运行');
      this.logger.error((err as Error).message);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (_) {
      // ignore disconnect errors
    }
  }
}
