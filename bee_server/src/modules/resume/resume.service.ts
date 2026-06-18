import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ResumeService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: any) {
    // 如果设为默认，先取消其他默认
    if (dto.isDefault) {
      await this.prisma.resume.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return this.prisma.resume.create({ data: { ...dto, userId } });
  }

  async getMyResumes(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getById(resumeId: string, userId: string) {
    const resume = await this.prisma.resume.findFirst({ where: { id: resumeId, userId } });
    if (!resume) throw new NotFoundException('简历不存在');
    return resume;
  }

  async update(resumeId: string, userId: string, dto: any) {
    if (dto.isDefault) {
      await this.prisma.resume.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return this.prisma.resume.updateMany({
      where: { id: resumeId, userId },
      data: dto,
    });
  }

  async delete(resumeId: string, userId: string) {
    return this.prisma.resume.deleteMany({ where: { id: resumeId, userId } });
  }
}
