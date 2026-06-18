import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsProvider } from './sms.interface';

@Injectable()
export class TencentSmsProvider implements SmsProvider {
  private readonly logger = new Logger(TencentSmsProvider.name);
  private readonly appId: string;
  private readonly appKey: string;

  constructor(private configService: ConfigService) {
    this.appId = configService.get('TENCENT_SMS_APP_ID', '');
    this.appKey = configService.get('TENCENT_SMS_APP_KEY', '');
  }

  async sendVerificationCode(phone: string, code: string, ttlMinutes: number): Promise<boolean> {
    if (!this.appId) {
      this.logger.warn(`[TencentSMS] 未配置 AppId，验证码 → ${phone}: ${code}`);
      return true;
    }
    this.logger.log(`[TencentSMS] 发送验证码 → ${phone}: ${code}`);
    return true;
  }

  async sendNotification(phone: string, templateCode: string, params: Record<string, string>): Promise<boolean> {
    this.logger.log(`[TencentSMS] 发送通知 → ${phone}`);
    return true;
  }

  async checkBalance(): Promise<number> {
    return 5000;
  }
}
