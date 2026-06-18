import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationService } from './application.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../tenant/tenant.decorator';
import { ApplyJobDto, UpdateApplicationDto } from './dto/application.dto';

class BatchUpdateDto {
  ids: string[];
  status: string;
}

@ApiTags('投递管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationController {
  constructor(private applicationService: ApplicationService) {}

  @Post()
  @ApiOperation({ summary: '投递简历' })
  async apply(@Body() dto: ApplyJobDto, @CurrentUser('id') userId: string,
              @Body('jobId') jobId: string) {
    return this.applicationService.apply(userId, jobId, dto.resumeId, dto.message);
  }

  @Get('mine')
  @ApiOperation({ summary: '我的投递记录' })
  async getMine(@CurrentUser('id') userId: string, @Query() query: any) {
    return this.applicationService.getMyApplications(userId, query);
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: '岗位收到的投递列表（招聘方）' })
  async getByJob(@Param('jobId') jobId: string, @Query() query: any,
                 @TenantId() tenantId: string) {
    return this.applicationService.getByJob(jobId, tenantId, query);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新投递状态' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateApplicationDto,
                     @TenantId() tenantId: string, @CurrentUser('id') operatorId: string) {
    return this.applicationService.updateStatus(id, tenantId, dto.status, operatorId);
  }

  @Post('batch/status')
  @ApiOperation({ summary: '批量更新投递状态' })
  async batchUpdate(@Body() dto: BatchUpdateDto,
                    @TenantId() tenantId: string) {
    return this.applicationService.batchUpdateStatus(dto.ids, tenantId, dto.status);
  }
}
