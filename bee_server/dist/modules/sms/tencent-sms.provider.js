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
var TencentSmsProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TencentSmsProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let TencentSmsProvider = TencentSmsProvider_1 = class TencentSmsProvider {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(TencentSmsProvider_1.name);
        this.appId = configService.get('TENCENT_SMS_APP_ID', '');
        this.appKey = configService.get('TENCENT_SMS_APP_KEY', '');
    }
    async sendVerificationCode(phone, code, ttlMinutes) {
        if (!this.appId) {
            this.logger.warn(`[TencentSMS] 未配置 AppId，验证码 → ${phone}: ${code}`);
            return true;
        }
        this.logger.log(`[TencentSMS] 发送验证码 → ${phone}: ${code}`);
        return true;
    }
    async sendNotification(phone, templateCode, params) {
        this.logger.log(`[TencentSMS] 发送通知 → ${phone}`);
        return true;
    }
    async checkBalance() {
        return 5000;
    }
};
exports.TencentSmsProvider = TencentSmsProvider;
exports.TencentSmsProvider = TencentSmsProvider = TencentSmsProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TencentSmsProvider);
//# sourceMappingURL=tencent-sms.provider.js.map