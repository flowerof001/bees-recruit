import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private prefix = 'bee:';

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const url = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.client = new Redis(url, { maxRetriesPerRequest: 3, lazyConnect: true });
    try {
      await this.client.connect();
      this.logger.log('Redis 连接成功');
    } catch (err) {
      this.logger.warn('Redis 连接失败，降级为内存模式');
    }
  }

  async onModuleDestroy() {
    await this.client?.quit();
  }

  getClient(): Redis | null {
    return this.client?.status === 'ready' ? this.client : null;
  }

  private key(k: string): string {
    return `${this.prefix}${k}`;
  }

  /** 缓存 JSON 数据 */
  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    const redis = this.getClient();
    if (redis) {
      await redis.setex(this.key(key), ttlSeconds, JSON.stringify(value));
    }
  }

  /** 读取缓存 */
  async get<T = any>(key: string): Promise<T | null> {
    const redis = this.getClient();
    if (!redis) return null;
    const val = await redis.get(this.key(key));
    return val ? JSON.parse(val) : null;
  }

  /** 删除缓存 */
  async del(key: string): Promise<void> {
    const redis = this.getClient();
    if (redis) await redis.del(this.key(key));
  }

  /** 删除匹配的 key */
  async delPattern(pattern: string): Promise<void> {
    const redis = this.getClient();
    if (!redis) return;
    const keys = await redis.keys(this.key(pattern));
    if (keys.length > 0) await redis.del(...keys);
  }

  /** 自增 */
  async incr(key: string, ttlSeconds = 60): Promise<number> {
    const redis = this.getClient();
    if (!redis) return 0;
    const k = this.key(key);
    const val = await redis.incr(k);
    if (val === 1) await redis.expire(k, ttlSeconds);
    return val;
  }

  /** 集合操作：添加 */
  async sadd(key: string, ...members: string[]): Promise<void> {
    const redis = this.getClient();
    if (redis) await redis.sadd(this.key(key), ...members);
  }

  /** 集合操作：判断成员 */
  async sismember(key: string, member: string): Promise<boolean> {
    const redis = this.getClient();
    if (!redis) return false;
    return (await redis.sismember(this.key(key), member)) === 1;
  }

  /** 集合操作：移除 */
  async srem(key: string, ...members: string[]): Promise<void> {
    const redis = this.getClient();
    if (redis) await redis.srem(this.key(key), ...members);
  }

  /** 发布消息 */
  async publish(channel: string, message: string): Promise<void> {
    const redis = this.getClient();
    if (redis) await redis.publish(this.key(channel), message);
  }
}
