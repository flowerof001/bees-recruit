import { Controller, Post, Get, Put, Body, Param, Query, HttpCode, HttpStatus,
  UseGuards, Headers, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import {
  SendSmsDto, PhoneLoginDto, PhoneRegisterDto, PasswordLoginDto,
  WechatLoginDto, BindEmailDto, ChangePasswordDto, SetPasswordDto,
  ResetRequestDto, ResetPasswordDto, BindWechatPhoneDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

function getClientMeta(req: Request) {
  return {
    ip: (req.headers['x-forwarded-for'] as string) || req.ip,
    userAgent: req.headers['user-agent'] as string,
    device: req.headers['x-device-type'] as string,
  };
}

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('sms/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '发送短信验证码' })
  async sendSms(@Body() dto: SendSmsDto) {
    await this.authService.sendSmsCode(dto.phone);
    return { message: '验证码已发送' };
  }

  @Public()
  @Post('phone/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '手机号+验证码登录' })
  async phoneLogin(@Body() dto: PhoneLoginDto, @Req() req: Request) {
    return this.authService.loginByPhone(dto.phone, dto.code, { ...getClientMeta(req), device: dto.device });
  }

  @Public()
  @Post('phone/register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '手机号注册' })
  async phoneRegister(@Body() dto: PhoneRegisterDto) {
    return this.authService.registerByPhone(dto);
  }

  @Public()
  @Post('password/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '密码登录' })
  async passwordLogin(@Body() dto: PasswordLoginDto, @Req() req: Request) {
    return this.authService.loginByPassword(dto.login, dto.password, { ...getClientMeta(req), device: dto.device });
  }

  @Public()
  @Post('wechat/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '微信扫码登录' })
  async wechatLogin(@Body() dto: WechatLoginDto, @Req() req: Request) {
    return this.authService.loginByWechat(dto.code, { ...getClientMeta(req), device: dto.device });
  }

  @Post('wechat/bind-phone')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '微信绑定手机号' })
  async bindWechatPhone(@Body() dto: BindWechatPhoneDto, @CurrentUser('id') userId: string) {
    await this.authService.bindWechatPhone(userId, dto.code);
    return { message: '手机号绑定成功' };
  }

  @Post('password/set')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '设置密码' })
  async setPassword(@Body() dto: SetPasswordDto, @CurrentUser('id') userId: string) {
    await this.authService.setPassword(userId, dto.password);
    return { message: '密码设置成功' };
  }

  @Put('password/change')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '修改密码' })
  async changePassword(@Body() dto: ChangePasswordDto, @CurrentUser('id') userId: string) {
    await this.authService.changePassword(userId, dto.oldPassword, dto.newPassword);
    return { message: '密码修改成功' };
  }

  @Public()
  @Post('password/reset-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '请求密码重置' })
  async requestReset(@Body() dto: ResetRequestDto) {
    return this.authService.requestPasswordReset(dto.target, dto.method as any);
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '重置密码' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('email/bind')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '绑定邮箱' })
  async bindEmail(@Body() dto: BindEmailDto, @CurrentUser('id') userId: string) {
    await this.authService.bindEmail(userId, dto.email);
    return { message: '邮箱绑定成功' };
  }

  @Get('devices')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '我的登录设备' })
  async getDevices(@CurrentUser('id') userId: string) {
    return this.authService.getDevices(userId);
  }

  @Post('devices/:deviceId/revoke')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '踢出设备' })
  async revokeDevice(@Param('deviceId') deviceId: string, @CurrentUser('id') userId: string) {
    await this.authService.revokeDevice(userId, deviceId);
    return { message: '设备已踢出' };
  }

  @Post('devices/revoke-all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '踢出所有设备' })
  async revokeAll(@CurrentUser('id') userId: string) {
    await this.authService.revokeAllDevices(userId);
    return { message: '所有设备已踢出' };
  }

  @Get('login-logs')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '登录历史' })
  async getLoginLogs(@CurrentUser('id') userId: string, @Query() query: any) {
    return this.authService.getLoginLogs(userId, query);
  }

  @Public()
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '管理员登录' })
  async adminLogin(@Body() body: { username: string; password: string }, @Req() req: Request) {
    return this.authService.adminLogin(body.username, body.password, getClientMeta(req));
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '登出' })
  async logout(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (token) await this.authService.logout(token);
    return { message: '已登出' };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新 Token' })
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }
}
