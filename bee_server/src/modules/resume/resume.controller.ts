import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ResumeService } from './resume.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('简历')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('resumes')
export class ResumeController {
  constructor(private resumeService: ResumeService) {}

  @Post()
  @ApiOperation({ summary: '创建简历' })
  async create(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.resumeService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '我的简历列表' })
  async getMine(@CurrentUser('id') userId: string) {
    return this.resumeService.getMyResumes(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '简历详情' })
  async getById(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.resumeService.getById(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新简历' })
  async update(@Param('id') id: string, @Body() dto: any, @CurrentUser('id') userId: string) {
    return this.resumeService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除简历' })
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.resumeService.delete(id, userId);
  }
}
