import { ConfigService } from '@nestjs/config';
import { SmsProvider } from './sms.interface';
export declare class TencentSmsProvider implements SmsProvider {
    private configService;
    private readonly logger;
    private readonly appId;
    private readonly appKey;
    constructor(configService: ConfigService);
    sendVerificationCode(phone: string, code: string, ttlMinutes: number): Promise<boolean>;
    sendNotification(phone: string, templateCode: string, params: Record<string, string>): Promise<boolean>;
    checkBalance(): Promise<number>;
}
