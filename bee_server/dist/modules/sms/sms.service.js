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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/cache/redis.service");
const sms_interface_1 = require("./sms.interface");
let SmsService = SmsService_1 = class SmsService {
    constructor(redisService, provider) {
        this.redisService = redisService;
        this.provider = provider;
        this.logger = new common_1.Logger(SmsService_1.name);
        this.memoryStore = new Map();
    }
    async sendCode(phone) {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        const ttl = 300;
        const stored = await this.redisService.set(`sms:${phone}`, { code, phone }, ttl);
        this.memoryStore.set(phone, { code, expiresAt: Date.now() + ttl * 1000 });
        if (this.provider) {
            const sent = await this.provider.sendVerificationCode(phone, code, 5);
            if (!sent)
                return { success: false };
        }
        else {
            this.logger.log(`[SMS] 控制台模式 → ${phone}: ${code}`);
        }
        return { success: true, code: process.env.NODE_ENV === 'development' ? code : undefined };
    }
    async verifyCode(phone, code) {
        const redisData = await this.redisService.get(`sms:${phone}`);
        if (redisData) {
            if (redisData.code !== code)
                return false;
            await this.redisService.del(`sms:${phone}`);
            return true;
        }
        const record = this.memoryStore.get(phone);
        if (!record)
            return false;
        if (Date.now() > record.expiresAt) {
            this.memoryStore.delete(phone);
            return false;
        }
        const valid = record.code === code;
        if (valid)
            this.memoryStore.delete(phone);
        return valid;
    }
    async canSend(phone) {
        const key = `sms:rate:${phone}`;
        const count = await this.redisService.incr(key, 60);
        return count <= 5;
    }
    async sendNotification(phone, templateCode, params) {
        if (this.provider) {
            return this.provider.sendNotification(phone, templateCode, params);
        }
        this.logger.log(`[SMS] 通知 → ${phone}: ${JSON.stringify(params)}`);
        return true;
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, common_1.Inject)(sms_interface_1.SMS_PROVIDER)),
    __metadata("design:paramtypes", [redis_service_1.RedisService, Object])
], SmsService);
//# sourceMappingURL=sms.service.js.map