import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('企业管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Get('search')
  @ApiOperation({ summary: '搜索企业' })
  async search(@Query() query: any) {
    return this.companyService.searchCompanies(query);
  }

  @Get('mine')
  @ApiOperation({ summary: '获取我的企业详情' })
  async getMyTenant(@CurrentUser('id') userId: string) {
    return this.companyService.getMyTenant(userId);
  }

  @Get('mine/brief')
  @ApiOperation({ summary: '获取我的企业简要信息' })
  async getMyTenantBrief(@CurrentUser('id') userId: string) {
    return this.companyService.getMyTenantBrief(userId);
  }

  @Post()
  @ApiOperation({ summary: '创建企业' })
  async create(@CurrentUser('id') userId: string, @Body() body: any) {
    return this.companyService.create(userId, body);
  }

  @Get(':id')
  @ApiOperation({ summary: '企业公开主页' })
  async getPublicProfile(@Param('id') id: string) {
    return this.companyService.getPublicProfile(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新企业信息' })
  async updateProfile(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.companyService.updateProfile(id, userId, body);
  }

  @Post(':id/join')
  @ApiOperation({ summary: '加入企业' })
  async join(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.companyService.join(id, userId);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: '离开企业' })
  async leave(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.companyService.leave(id, userId);
  }

  @Get(':id/members')
  @ApiOperation({ summary: '获取企业成员列表' })
  async getMembers(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.companyService.getMembers(id, userId);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: '移除成员' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('id') operatorId: string,
  ) {
    return this.companyService.removeMember(id, operatorId, targetUserId);
  }

  @Put(':id/members/:userId/role')
  @ApiOperation({ summary: '修改成员角色' })
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('id') operatorId: string,
    @Body() body: { role: string },
  ) {
    return this.companyService.updateMemberRole(id, operatorId, targetUserId, body.role);
  }
}
