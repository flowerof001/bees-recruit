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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTenantDto = exports.BindWechatPhoneDto = exports.ResetPasswordDto = exports.ResetRequestDto = exports.SetPasswordDto = exports.ChangePasswordDto = exports.BindEmailDto = exports.WechatLoginDto = exports.PasswordLoginDto = exports.PhoneRegisterDto = exports.PhoneLoginDto = exports.SendSmsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SendSmsDto {
}
exports.SendSmsDto = SendSmsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '13800138000' }),
    (0, class_validator_1.IsPhoneNumber)('CN'),
    __metadata("design:type", String)
], SendSmsDto.prototype, "phone", void 0);
class PhoneLoginDto {
}
exports.PhoneLoginDto = PhoneLoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '13800138000' }),
    (0, class_validator_1.IsPhoneNumber)('CN'),
    __metadata("design:type", String)
], PhoneLoginDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(4),
    __metadata("design:type", String)
], PhoneLoginDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PhoneLoginDto.prototype, "device", void 0);
class PhoneRegisterDto {
}
exports.PhoneRegisterDto = PhoneRegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '13800138000' }),
    (0, class_validator_1.IsPhoneNumber)('CN'),
    __metadata("design:type", String)
], PhoneRegisterDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(4),
    __metadata("design:type", String)
], PhoneRegisterDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'JOB_SEEKER' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['JOB_SEEKER', 'RECRUITER']),
    __metadata("design:type", String)
], PhoneRegisterDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PhoneRegisterDto.prototype, "nickname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PhoneRegisterDto.prototype, "password", void 0);
class PasswordLoginDto {
}
exports.PasswordLoginDto = PasswordLoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '13800138000' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PasswordLoginDto.prototype, "login", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'mypassword' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PasswordLoginDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PasswordLoginDto.prototype, "device", void 0);
class WechatLoginDto {
}
exports.WechatLoginDto = WechatLoginDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WechatLoginDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WechatLoginDto.prototype, "device", void 0);
class BindEmailDto {
}
exports.BindEmailDto = BindEmailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], BindEmailDto.prototype, "email", void 0);
class ChangePasswordDto {
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "oldPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
class SetPasswordDto {
}
exports.SetPasswordDto = SetPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], SetPasswordDto.prototype, "password", void 0);
class ResetRequestDto {
}
exports.ResetRequestDto = ResetRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResetRequestDto.prototype, "target", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['PHONE', 'EMAIL'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['PHONE', 'EMAIL']),
    __metadata("design:type", String)
], ResetRequestDto.prototype, "method", void 0);
class ResetPasswordDto {
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
class BindWechatPhoneDto {
}
exports.BindWechatPhoneDto = BindWechatPhoneDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BindWechatPhoneDto.prototype, "code", void 0);
class CreateTenantDto {
}
exports.CreateTenantDto = CreateTenantDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '字节跳动' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "industry", void 0);
//# sourceMappingURL=auth.dto.js.map