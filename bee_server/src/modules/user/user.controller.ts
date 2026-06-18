import { Controller, Get, Put, Delete, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('用户')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: '获取个人信息' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: '更新个人信息' })
  async updateProfile(@CurrentUser('id') userId: string, @Body() body: any) {
    return this.userService.updateProfile(userId, body);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取用户统计数据' })
  async getStats(@CurrentUser('id') userId: string) {
    return this.userService.getUserStats(userId);
  }

  @Get('applications')
  @ApiOperation({ summary: '获取我的投递记录' })
  async getApplications(@CurrentUser('id') userId: string, @Query() query: any) {
    return this.userService.getApplications(userId, query);
  }

  @Post('bind-phone')
  @ApiOperation({ summary: '绑定/更换手机号' })
  async bindPhone(@CurrentUser('id') userId: string, @Body() body: { phone: string; code: string }) {
    return this.userService.bindPhone(userId, body.phone, body.code);
  }

  @Post('bind-email')
  @ApiOperation({ summary: '绑定邮箱' })
  async bindEmail(@CurrentUser('id') userId: string, @Body() body: { email: string }) {
    return this.userService.bindEmail(userId, body.email);
  }

  @Put('password')
  @ApiOperation({ summary: '设置/修改密码' })
  async setPassword(
    @CurrentUser('id') userId: string,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.userService.setPassword(userId, body.oldPassword, body.newPassword);
  }

  @Delete('account')
  @ApiOperation({ summary: '注销账号' })
  async deleteAccount(@CurrentUser('id') userId: string) {
    return this.userService.deleteAccount(userId);
  }
}
