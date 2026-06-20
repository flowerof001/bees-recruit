import { Request } from 'express';
import { AuthService } from './auth.service';
import { SendSmsDto, PhoneLoginDto, PhoneRegisterDto, PasswordLoginDto, WechatLoginDto, BindEmailDto, ChangePasswordDto, SetPasswordDto, ResetRequestDto, ResetPasswordDto, BindWechatPhoneDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    sendSms(dto: SendSmsDto): Promise<{
        message: string;
    }>;
    phoneLogin(dto: PhoneLoginDto, req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            phone: any;
            email: any;
            nickname: any;
            avatar: any;
            role: any;
        };
    }>;
    phoneRegister(dto: PhoneRegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            phone: any;
            email: any;
            nickname: any;
            avatar: any;
            role: any;
        };
    }>;
    passwordLogin(dto: PasswordLoginDto, req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            phone: any;
            email: any;
            nickname: any;
            avatar: any;
            role: any;
        };
    }>;
    wechatLogin(dto: WechatLoginDto, req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            phone: any;
            email: any;
            nickname: any;
            avatar: any;
            role: any;
        };
    }>;
    bindWechatPhone(dto: BindWechatPhoneDto, userId: string): Promise<{
        message: string;
    }>;
    setPassword(dto: SetPasswordDto, userId: string): Promise<{
        message: string;
    }>;
    changePassword(dto: ChangePasswordDto, userId: string): Promise<{
        message: string;
    }>;
    requestReset(dto: ResetRequestDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    bindEmail(dto: BindEmailDto, userId: string): Promise<{
        message: string;
    }>;
    getDevices(userId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        expiresAt: Date;
        deviceId: string;
        deviceName: string | null;
        deviceType: string | null;
        pushToken: string | null;
        refreshToken: string | null;
        lastActiveAt: Date;
    }[]>;
    revokeDevice(deviceId: string, userId: string): Promise<{
        message: string;
    }>;
    revokeAll(userId: string): Promise<{
        message: string;
    }>;
    getLoginLogs(userId: string, query: any): Promise<import("../../common/helpers/pagination").PaginatedResult<{
        method: string;
        ip: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        userAgent: string | null;
        device: string | null;
        success: boolean;
        failReason: string | null;
    }>>;
    adminLogin(body: {
        username: string;
        password: string;
    }, req: Request): Promise<{
        accessToken: string;
        user: {
            id: string;
            createdAt: Date;
            passwordHash: string;
            role: string;
            username: string;
        };
    }>;
    logout(authHeader: string): Promise<{
        message: string;
    }>;
    refresh(body: {
        refreshToken: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            phone: any;
            email: any;
            nickname: any;
            avatar: any;
            role: any;
        };
    }>;
}
