import { Controller, Post, Get, Body, Param, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateTenantDto } from '../auth/dto/auth.dto';

@ApiTags('企业/租户')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Post()
  @ApiOperation({ summary: '创建企业（入驻）' })
  async create(@Body() dto: CreateTenantDto, @CurrentUser('id') userId: string) {
    return this.tenantService.create({ ...dto, ownerId: userId });
  }

  @Get('mine')
  @ApiOperation({ summary: '获取我的企业' })
  async getMine(@CurrentUser('id') userId: string) {
    return this.tenantService.getMyTenant(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取企业详情' })
  async getById(@Param('id') id: string) {
    return this.tenantService.getTenantById(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: '添加企业成员' })
  async addMember(@Param('id') id: string, @Body() body: { userId: string; role?: string }) {
    return this.tenantService.addMember(id, body.userId, body.role);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: '移除企业成员' })
  async removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.tenantService.removeMember(id, userId);
  }
}
