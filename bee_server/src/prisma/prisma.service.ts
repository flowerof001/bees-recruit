import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    const opts: any = { log: ['error', 'warn'] };

    if (dbUrl) {
      try {
        const { Pool } = require('pg');
        const { PrismaPg } = require('@prisma/adapter-pg');
        const pool = new Pool({ connectionString: dbUrl });
        opts.adapter = new PrismaPg(pool);
      } catch (e) {
        // adapter 不可用时降级
      }
    }

    super(opts);
  }

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      this.logger.warn('⚠️ DATABASE_URL 未设置，跳过数据库连接');
      return;
    }
    try {
      await this.$connect();
      this.logger.log('📦 Prisma 已连接 PostgreSQL');
    } catch (err) {
      this.logger.error('数据库连接失败: ' + (err as Error).message);
    }
  }

  async onModuleDestroy() {
    try { await this.$disconnect(); } catch (_) {}
  }
}
