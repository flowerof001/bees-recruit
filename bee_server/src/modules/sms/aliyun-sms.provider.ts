import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsProvider } from './sms.interface';

@Injectable()
export class AliyunSmsProvider implements SmsProvider {
  private readonly logger = new Logger(AliyunSmsProvider.name);
  private readonly accessKeyId: string;
  private readonly accessKeySecret: string;
  private readonly signName: string;
  private readonly templateCode: string;

  constructor(private configService: ConfigService) {
    this.accessKeyId = configService.get('SMS_ACCESS_KEY_ID', '');
    this.accessKeySecret = configService.get('SMS_ACCESS_KEY_SECRET', '');
    this.signName = configService.get('SMS_SIGN_NAME', '小蜜蜂招工');
    this.templateCode = configService.get('SMS_TEMPLATE_CODE', '');
  }

  async sendVerificationCode(phone: string, code: string, ttlMinutes: number): Promise<boolean> {
    if (!this.accessKeyId) {
      this.logger.warn(`[AliyunSMS] 未配置 AccessKey，验证码 → ${phone}: ${code}`);
      return true;
    }
    // TODO: 接入阿里云 SMS SDK
    // const client = new Dysmsapi({ accessKeyId: this.accessKeyId, accessKeySecret: this.accessKeySecret });
    // await client.sendSms({ PhoneNumbers: phone, SignName: this.signName, TemplateCode: this.templateCode, TemplateParam: JSON.stringify({ code }) });
    this.logger.log(`[AliyunSMS] 发送验证码 → ${phone}: ${code}`);
    return true;
  }

  async sendNotification(phone: string, templateCode: string, params: Record<string, string>): Promise<boolean> {
    this.logger.log(`[AliyunSMS] 发送通知 → ${phone}, 模板: ${templateCode}`);
    return true;
  }

  async checkBalance(): Promise<number> {
    return 10000; // 模拟余额
  }
}
