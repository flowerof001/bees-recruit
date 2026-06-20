import { ConfigService } from '@nestjs/config';
import { SmsProvider } from './sms.interface';
export declare class AliyunSmsProvider implements SmsProvider {
    private configService;
    private readonly logger;
    private readonly accessKeyId;
    private readonly accessKeySecret;
    private readonly signName;
    private readonly templateCode;
    constructor(configService: ConfigService);
    sendVerificationCode(phone: string, code: string, ttlMinutes: number): Promise<boolean>;
    sendNotification(phone: string, templateCode: string, params: Record<string, string>): Promise<boolean>;
    checkBalance(): Promise<number>;
}
