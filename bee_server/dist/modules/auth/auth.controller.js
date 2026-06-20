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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
function getClientMeta(req) {
    return {
        ip: req.headers['x-forwarded-for'] || req.ip,
        userAgent: req.headers['user-agent'],
        device: req.headers['x-device-type'],
    };
}
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async sendSms(dto) {
        await this.authService.sendSmsCode(dto.phone);
        return { message: '验证码已发送' };
    }
    async phoneLogin(dto, req) {
        return this.authService.loginByPhone(dto.phone, dto.code, { ...getClientMeta(req), device: dto.device });
    }
    async phoneRegister(dto) {
        return this.authService.registerByPhone(dto);
    }
    async passwordLogin(dto, req) {
        return this.authService.loginByPassword(dto.login, dto.password, { ...getClientMeta(req), device: dto.device });
    }
    async wechatLogin(dto, req) {
        return this.authService.loginByWechat(dto.code, { ...getClientMeta(req), device: dto.device });
    }
    async bindWechatPhone(dto, userId) {
        await this.authService.bindWechatPhone(userId, dto.code);
        return { message: '手机号绑定成功' };
    }
    async setPassword(dto, userId) {
        await this.authService.setPassword(userId, dto.password);
        return { message: '密码设置成功' };
    }
    async changePassword(dto, userId) {
        await this.authService.changePassword(userId, dto.oldPassword, dto.newPassword);
        return { message: '密码修改成功' };
    }
    async requestReset(dto) {
        return this.authService.requestPasswordReset(dto.target, dto.method);
    }
    async resetPassword(dto) {
        return this.authService.resetPassword(dto.token, dto.newPassword);
    }
    async bindEmail(dto, userId) {
        await this.authService.bindEmail(userId, dto.email);
        return { message: '邮箱绑定成功' };
    }
    async getDevices(userId) {
        return this.authService.getDevices(userId);
    }
    async revokeDevice(deviceId, userId) {
        await this.authService.revokeDevice(userId, deviceId);
        return { message: '设备已踢出' };
    }
    async revokeAll(userId) {
        await this.authService.revokeAllDevices(userId);
        return { message: '所有设备已踢出' };
    }
    async getLoginLogs(userId, query) {
        return this.authService.getLoginLogs(userId, query);
    }
    async adminLogin(body, req) {
        return this.authService.adminLogin(body.username, body.password, getClientMeta(req));
    }
    async logout(authHeader) {
        const token = authHeader?.replace('Bearer ', '');
        if (token)
            await this.authService.logout(token);
        return { message: '已登出' };
    }
    async refresh(body) {
        return this.authService.refreshToken(body.refreshToken);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('sms/send'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '发送短信验证码' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SendSmsDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendSms", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('phone/login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '手机号+验证码登录' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.PhoneLoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "phoneLogin", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('phone/register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '手机号注册' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.PhoneRegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "phoneRegister", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('password/login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '密码登录' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.PasswordLoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "passwordLogin", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('wechat/login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '微信扫码登录' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.WechatLoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "wechatLogin", null);
__decorate([
    (0, common_1.Post)('wechat/bind-phone'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '微信绑定手机号' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.BindWechatPhoneDto, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "bindWechatPhone", null);
__decorate([
    (0, common_1.Post)('password/set'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '设置密码' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SetPasswordDto, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "setPassword", null);
__decorate([
    (0, common_1.Put)('password/change'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '修改密码' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ChangePasswordDto, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('password/reset-request'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '请求密码重置' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ResetRequestDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestReset", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('password/reset'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '重置密码' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('email/bind'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '绑定邮箱' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.BindEmailDto, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "bindEmail", null);
__decorate([
    (0, common_1.Get)('devices'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: '我的登录设备' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getDevices", null);
__decorate([
    (0, common_1.Post)('devices/:deviceId/revoke'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '踢出设备' }),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeDevice", null);
__decorate([
    (0, common_1.Post)('devices/revoke-all'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '踢出所有设备' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeAll", null);
__decorate([
    (0, common_1.Get)('login-logs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: '登录历史' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getLoginLogs", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('admin/login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '管理员登录' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminLogin", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '登出' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '刷新 Token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('认证'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map