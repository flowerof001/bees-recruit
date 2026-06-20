"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RedisService_1.name);
        this.prefix = 'bee:';
    }
    async onModuleInit() {
        const url = this.configService.get('REDIS_URL', 'redis://localhost:6379');
        this.client = new ioredis_1.default(url, { maxRetriesPerRequest: 3, lazyConnect: true });
        try {
            await this.client.connect();
            this.logger.log('Redis 连接成功');
        }
        catch (err) {
            this.logger.warn('Redis 连接失败，降级为内存模式');
        }
    }
    async onModuleDestroy() {
        await this.client?.quit();
    }
    getClient() {
        return this.client?.status === 'ready' ? this.client : null;
    }
    key(k) {
        return `${this.prefix}${k}`;
    }
    async set(key, value, ttlSeconds = 300) {
        const redis = this.getClient();
        if (redis) {
            await redis.setex(this.key(key), ttlSeconds, JSON.stringify(value));
        }
    }
    async get(key) {
        const redis = this.getClient();
        if (!redis)
            return null;
        const val = await redis.get(this.key(key));
        return val ? JSON.parse(val) : null;
    }
    async del(key) {
        const redis = this.getClient();
        if (redis)
            await redis.del(this.key(key));
    }
    async delPattern(pattern) {
        const redis = this.getClient();
        if (!redis)
            return;
        const keys = await redis.keys(this.key(pattern));
        if (keys.length > 0)
            await redis.del(...keys);
    }
    async incr(key, ttlSeconds = 60) {
        const redis = this.getClient();
        if (!redis)
            return 0;
        const k = this.key(key);
        const val = await redis.incr(k);
        if (val === 1)
            await redis.expire(k, ttlSeconds);
        return val;
    }
    async sadd(key, ...members) {
        const redis = this.getClient();
        if (redis)
            await redis.sadd(this.key(key), ...members);
    }
    async sismember(key, member) {
        const redis = this.getClient();
        if (!redis)
            return false;
        return (await redis.sismember(this.key(key), member)) === 1;
    }
    async srem(key, ...members) {
        const redis = this.getClient();
        if (redis)
            await redis.srem(this.key(key), ...members);
    }
    async publish(channel, message) {
        const redis = this.getClient();
        if (redis)
            await redis.publish(this.key(channel), message);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map