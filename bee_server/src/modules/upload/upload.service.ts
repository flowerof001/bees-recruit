import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

export interface UploadedFile {
  url: string;
  key: string;
  size: number;
  mimeType: string;
  originalName: string;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly allowedDocTypes = ['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', path.join(process.cwd(), 'uploads'));
    this.baseUrl = this.configService.get('UPLOAD_BASE_URL', process.env.UPLOAD_BASE_URL || 'http://localhost:3000/uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadAvatar(file: any, userId: string): Promise<UploadedFile> {
    this.validateImage(file);
    const result = await this.saveFile(file, `avatars/${userId}`);
    this.logger.log(`头像上传: ${result.url}`);
    return result;
  }

  async uploadResumeAttachment(file: any, userId: string): Promise<UploadedFile> {
    this.validateDocument(file);
    const result = await this.saveFile(file, `resumes/${userId}`);
    this.logger.log(`简历附件上传: ${result.url}`);
    return result;
  }

  async uploadCompanyLogo(file: any, tenantId: string): Promise<UploadedFile> {
    this.validateImage(file);
    const result = await this.saveFile(file, `companies/${tenantId}`);
    this.logger.log(`企业Logo上传: ${result.url}`);
    return result;
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      this.logger.log(`文件已删除: ${key}`);
    }
  }

  private async saveFile(file: any, subDir: string): Promise<UploadedFile> {
    const dir = path.join(this.uploadDir, subDir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const ext = path.extname(file.originalname);
    const filename = `${uuid()}${ext}`;
    const filePath = path.join(dir, filename);
    const key = `${subDir}/${filename}`;

    fs.writeFileSync(filePath, file.buffer);

    return {
      url: `${this.baseUrl}/${key}`,
      key,
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname,
    };
  }

  private validateImage(file: any) {
    if (file.size > this.maxFileSize) throw new BadRequestException('文件大小不能超过 10MB');
    if (!this.allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException('仅支持 JPG、PNG、GIF、WebP 格式');
    }
  }

  private validateDocument(file: any) {
    if (file.size > this.maxFileSize) throw new BadRequestException('文件大小不能超过 10MB');
    if (!this.allowedDocTypes.includes(file.mimetype)) {
      throw new BadRequestException('仅支持 PDF、DOC、DOCX 格式');
    }
  }
}
