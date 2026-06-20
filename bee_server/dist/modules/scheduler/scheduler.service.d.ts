import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/cache/redis.service';
export declare class SchedulerService {
    private prisma;
    private redisService;
    private readonly logger;
    constructor(prisma: PrismaService, redisService: RedisService);
    checkExpiredSubscriptions(): Promise<void>;
    resetDailyChatCounts(): Promise<void>;
    cleanExpiredSmsCodes(): Promise<void>;
    cleanExpiredBlacklist(): Promise<void>;
    dailyStats(): Promise<void>;
}
