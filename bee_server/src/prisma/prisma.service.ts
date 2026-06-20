import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const dbUrl = process.env.DATABASE_URL || '';

    if (!dbUrl) {
      throw new Error(
        '❌ DATABASE_URL 未设置。请在 Render Dashboard 中为 bee-api 服务添加环境变量 DATABASE_URL，\n' +
        '   值为 bee-db 数据库的 Internal Connection String。'
      );
    }

    // Render 使用 postgres://，Prisma 需要 postgresql://
    const url = dbUrl.startsWith('postgres://') ? dbUrl.replace('postgres://', 'postgresql://') : dbUrl;

    super({
      log: ['error', 'warn'],
    });

    // 通过内部属性设置 datasource URL
    this.logger.log(`Prisma 初始化完成，DB: ${url.replace(/\/\/.*@/, '//***@')}`);
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('📦 Prisma 已连接 PostgreSQL');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('📦 Prisma 已断开');
  }
}
