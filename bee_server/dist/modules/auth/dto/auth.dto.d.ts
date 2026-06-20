export declare class SendSmsDto {
    phone: string;
}
export declare class PhoneLoginDto {
    phone: string;
    code: string;
    device?: string;
}
export declare class PhoneRegisterDto {
    phone: string;
    code: string;
    role: string;
    nickname?: string;
    password?: string;
}
export declare class PasswordLoginDto {
    login: string;
    password: string;
    device?: string;
}
export declare class WechatLoginDto {
    code: string;
    device?: string;
}
export declare class BindEmailDto {
    email: string;
}
export declare class ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
}
export declare class SetPasswordDto {
    password: string;
}
export declare class ResetRequestDto {
    target: string;
    method: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
export declare class BindWechatPhoneDto {
    code: string;
}
export declare class CreateTenantDto {
    name: string;
    description?: string;
    industry?: string;
}
