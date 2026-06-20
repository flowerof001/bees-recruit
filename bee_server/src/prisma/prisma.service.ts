import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const dbUrl = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder';
    const pool = new Pool({
      connectionString: dbUrl,
      max: 3,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    });
    super({
      adapter: new PrismaPg(pool),
      log: ['error', 'warn'],
    });
    if (!process.env.DATABASE_URL) {
      this.logger.warn('⚠️ DATABASE_URL 未设置，使用占位连接');
    }
  }

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      this.logger.warn('⚠️ 数据库未配置，服务以降级模式运行');
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
