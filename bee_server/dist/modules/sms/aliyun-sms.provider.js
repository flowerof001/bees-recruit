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
var AliyunSmsProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliyunSmsProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AliyunSmsProvider = AliyunSmsProvider_1 = class AliyunSmsProvider {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(AliyunSmsProvider_1.name);
        this.accessKeyId = configService.get('SMS_ACCESS_KEY_ID', '');
        this.accessKeySecret = configService.get('SMS_ACCESS_KEY_SECRET', '');
        this.signName = configService.get('SMS_SIGN_NAME', '小蜜蜂招工');
        this.templateCode = configService.get('SMS_TEMPLATE_CODE', '');
    }
    async sendVerificationCode(phone, code, ttlMinutes) {
        if (!this.accessKeyId) {
            this.logger.warn(`[AliyunSMS] 未配置 AccessKey，验证码 → ${phone}: ${code}`);
            return true;
        }
        this.logger.log(`[AliyunSMS] 发送验证码 → ${phone}: ${code}`);
        return true;
    }
    async sendNotification(phone, templateCode, params) {
        this.logger.log(`[AliyunSMS] 发送通知 → ${phone}, 模板: ${templateCode}`);
        return true;
    }
    async checkBalance() {
        return 10000;
    }
};
exports.AliyunSmsProvider = AliyunSmsProvider;
exports.AliyunSmsProvider = AliyunSmsProvider = AliyunSmsProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AliyunSmsProvider);
//# sourceMappingURL=aliyun-sms.provider.js.map