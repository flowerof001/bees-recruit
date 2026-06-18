import { IsString, IsOptional, IsPhoneNumber, IsEmail, MinLength, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendSmsDto {
  @ApiProperty({ example: '13800138000' })
  @IsPhoneNumber('CN')
  phone: string;
}

export class PhoneLoginDto {
  @ApiProperty({ example: '13800138000' })
  @IsPhoneNumber('CN')
  phone: string;
  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(4)
  code: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  device?: string;
}

export class PhoneRegisterDto {
  @ApiProperty({ example: '13800138000' })
  @IsPhoneNumber('CN')
  phone: string;
  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(4)
  code: string;
  @ApiProperty({ example: 'JOB_SEEKER' })
  @IsString()
  @IsIn(['JOB_SEEKER', 'RECRUITER'])
  role: string;
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nickname?: string;
  @ApiProperty({ required: false })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;
}

export class PasswordLoginDto {
  @ApiProperty({ example: '13800138000' })
  @IsString()
  login: string;
  @ApiProperty({ example: 'mypassword' })
  @IsString()
  password: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  device?: string;
}

export class WechatLoginDto {
  @ApiProperty()
  @IsString()
  code: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  device?: string;
}

export class BindEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  oldPassword: string;
  @ApiProperty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class SetPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class ResetRequestDto {
  @ApiProperty()
  @IsString()
  target: string;
  @ApiProperty({ enum: ['PHONE', 'EMAIL'] })
  @IsString()
  @IsIn(['PHONE', 'EMAIL'])
  method: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;
  @ApiProperty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class BindWechatPhoneDto {
  @ApiProperty()
  @IsString()
  code: string;
}

export class CreateTenantDto {
  @ApiProperty({ example: '字节跳动' })
  @IsString()
  @MinLength(2)
  name: string;
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  industry?: string;
}
