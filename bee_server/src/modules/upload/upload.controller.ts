import { Controller, Post, Delete, Param, UseGuards, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../tenant/tenant.decorator';

@ApiTags('文件上传')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('avatar')
  @ApiOperation({ summary: '上传头像' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: any, @CurrentUser('id') userId: string) {
    return this.uploadService.uploadAvatar(file, userId);
  }

  @Post('resume')
  @ApiOperation({ summary: '上传简历附件' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(@UploadedFile() file: any, @CurrentUser('id') userId: string) {
    return this.uploadService.uploadResumeAttachment(file, userId);
  }

  @Post('company-logo')
  @ApiOperation({ summary: '上传企业 Logo' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(@UploadedFile() file: any, @TenantId() tenantId: string) {
    return this.uploadService.uploadCompanyLogo(file, tenantId);
  }

  @Delete(':key')
  @ApiOperation({ summary: '删除文件' })
  async deleteFile(@Param('key') key: string) {
    await this.uploadService.deleteFile(key);
    return { success: true };
  }
}
