import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('管理后台')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ====== 数据看板 ======
  @Get('dashboard')
  @ApiOperation({ summary: '平台数据看板' })
  async dashboard() {
    return this.adminService.getDashboard();
  }

  // ====== 租户管理 ======
  @Get('tenants')
  @ApiOperation({ summary: '租户列表' })
  async getTenants(@Query() query: any) {
    return this.adminService.getTenants(query);
  }

  @Get('tenants/:id')
  @ApiOperation({ summary: '租户详情' })
  async getTenant(@Param('id') id: string) {
    return this.adminService.getTenantDetail(id);
  }

  @Put('tenants/:id/status')
  @ApiOperation({ summary: '更新租户状态' })
  async updateTenantStatus(@Param('id') id: string, @Body() body: { status: string }, @CurrentUser('id') adminId: string) {
    return this.adminService.updateTenantStatus(id, body.status, adminId);
  }

  @Post('tenants/:id/verify')
  @ApiOperation({ summary: '认证企业' })
  async verifyTenant(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.adminService.verifyTenant(id, adminId);
  }

  @Get('tenants/export')
  @ApiOperation({ summary: '导出租户数据' })
  async exportTenants() {
    return this.adminService.exportTenants();
  }

  // ====== 用户管理 ======
  @Get('users')
  @ApiOperation({ summary: '用户列表' })
  async getUsers(@Query() query: any) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: '用户详情' })
  async getUser(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Put('users/:id/status')
  @ApiOperation({ summary: '更新用户状态（封禁/解封）' })
  async updateUserStatus(@Param('id') id: string, @Body() body: { status: string }, @CurrentUser('id') adminId: string) {
    return this.adminService.updateUserStatus(id, body.status, adminId);
  }

  @Get('users/export')
  @ApiOperation({ summary: '导出用户数据' })
  async exportUsers() {
    return this.adminService.exportUsers();
  }

  // ====== 支付记录 ======
  @Get('payments')
  @ApiOperation({ summary: '支付记录' })
  async getPayments(@Query() query: any) {
    return this.adminService.getAllPayments(query);
  }

  // ====== 审计日志 ======
  @Get('audit-logs')
  @ApiOperation({ summary: '审计日志' })
  async getAuditLogs(@Query() query: any) {
    return this.adminService.getAuditLogs(query);
  }

  // ====== 登录日志 ======
  @Get('login-logs')
  @ApiOperation({ summary: '全局登录日志' })
  async getLoginLogs(@Query() query: any) {
    return this.adminService.getLoginLogs(query);
  }

  // ====== 系统配置 ======
  @Get('configs')
  @ApiOperation({ summary: '系统配置列表' })
  async getConfigs() {
    return this.adminService.getSystemConfigs();
  }

  @Get('configs/:key')
  @ApiOperation({ summary: '获取配置' })
  async getConfig(@Param('key') key: string) {
    return this.adminService.getSystemConfig(key);
  }

  @Put('configs/:key')
  @ApiOperation({ summary: '设置配置' })
  async setConfig(
    @Param('key') key: string,
    @Body() body: { value: string; description?: string },
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.setSystemConfig(key, body.value, body.description, adminId);
  }

  @Delete('configs/:key')
  @ApiOperation({ summary: '删除配置' })
  async deleteConfig(@Param('key') key: string) {
    return this.adminService.deleteSystemConfig(key);
  }
}
