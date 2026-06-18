import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/job.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../tenant/tenant.decorator';

@ApiTags('岗位')
@Controller('jobs')
export class JobController {
  constructor(private jobService: JobService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '搜索/浏览岗位列表' })
  async search(@Query() query: any) {
    return this.jobService.search(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '岗位详情' })
  async getById(@Param('id') id: string) {
    return this.jobService.getById(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '发布岗位（需先加入企业）' })
  async create(@Body() dto: CreateJobDto, @CurrentUser('id') userId: string, @TenantId() tenantId: string) {
    return this.jobService.create(tenantId, userId, dto);
  }

  @Get('tenant/mine')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '我的企业发布的岗位' })
  async getMine(@TenantId() tenantId: string, @Query() query: any) {
    return this.jobService.getByTenant(tenantId, query);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '更新岗位' })
  async update(@Param('id') id: string, @Body() dto: any, @TenantId() tenantId: string) {
    return this.jobService.update(id, tenantId, dto);
  }

  @Patch(':id/close')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '关闭岗位' })
  async close(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.jobService.close(id, tenantId);
  }

  @Patch(':id/reopen')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '重新开放岗位' })
  async reopen(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.jobService.reopen(id, tenantId);
  }
}
