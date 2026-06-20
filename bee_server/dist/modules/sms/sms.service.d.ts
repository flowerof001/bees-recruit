import { RedisService } from '../../common/cache/redis.service';
import { SmsProvider } from './sms.interface';
export declare class SmsService {
    private redisService;
    private provider?;
    private readonly logger;
    private memoryStore;
    constructor(redisService: RedisService, provider?: SmsProvider);
    sendCode(phone: string): Promise<{
        success: boolean;
        code?: string;
    }>;
    verifyCode(phone: string, code: string): Promise<boolean>;
    canSend(phone: string): Promise<boolean>;
    sendNotification(phone: string, templateCode: string, params: Record<string, string>): Promise<boolean>;
}
