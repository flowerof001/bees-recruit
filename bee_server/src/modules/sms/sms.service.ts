import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { RedisService } from '../../common/cache/redis.service';
import { SmsProvider, SMS_PROVIDER } from './sms.interface';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  // 内存降级
  private memoryStore = new Map<string, { code: string; expiresAt: number }>();

  constructor(
    private redisService: RedisService,
    @Optional() @Inject(SMS_PROVIDER) private provider?: SmsProvider,
  ) {}

  /** 发送验证码 */
  async sendCode(phone: string): Promise<{ success: boolean; code?: string }> {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const ttl = 300;

    // 存储验证码
    const stored = await this.redisService.set(`sms:${phone}`, { code, phone }, ttl);
    this.memoryStore.set(phone, { code, expiresAt: Date.now() + ttl * 1000 });

    // 发送短信
    if (this.provider) {
      const sent = await this.provider.sendVerificationCode(phone, code, 5);
      if (!sent) return { success: false };
    } else {
      this.logger.log(`[SMS] 控制台模式 → ${phone}: ${code}`);
    }

    return { success: true, code: process.env.NODE_ENV === 'development' ? code : undefined };
  }

  /** 验证验证码 */
  async verifyCode(phone: string, code: string): Promise<boolean> {
    // 优先 Redis
    const redisData = await this.redisService.get<{ code: string }>(`sms:${phone}`);
    if (redisData) {
      if (redisData.code !== code) return false;
      await this.redisService.del(`sms:${phone}`);
      return true;
    }
    // 降级内存
    const record = this.memoryStore.get(phone);
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      this.memoryStore.delete(phone);
      return false;
    }
    const valid = record.code === code;
    if (valid) this.memoryStore.delete(phone);
    return valid;
  }

  /** 检查发送频率 */
  async canSend(phone: string): Promise<boolean> {
    const key = `sms:rate:${phone}`;
    const count = await this.redisService.incr(key, 60);
    return count <= 5; // 每分钟最多 5 次
  }

  /** 发送通知 */
  async sendNotification(phone: string, templateCode: string, params: Record<string, string>): Promise<boolean> {
    if (this.provider) {
      return this.provider.sendNotification(phone, templateCode, params);
    }
    this.logger.log(`[SMS] 通知 → ${phone}: ${JSON.stringify(params)}`);
    return true;
  }
}
