import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async create(dto: { name: string; description?: string; industry?: string; ownerId: string }) {
    const slug = this.generateSlug(dto.name);
    const existing = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('企业名称已被使用');

    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        industry: dto.industry,
        platformId: 'default',
        members: {
          create: { userId: dto.ownerId, role: 'OWNER' },
        },
      },
      include: { members: true },
    });

    // 更新用户角色为 RECRUITER
    await this.prisma.user.update({
      where: { id: dto.ownerId },
      data: { role: 'RECRUITER' },
    });

    return tenant;
  }

  async getMyTenant(userId: string) {
    const member = await this.prisma.tenantMember.findFirst({
      where: { userId },
      include: { tenant: true },
    });
    return member?.tenant ?? null;
  }

  async getTenantById(tenantId: string) {
    return this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { members: { include: { user: { select: { id: true, nickname: true, avatar: true, phone: true } } } } },
    });
  }

  async addMember(tenantId: string, userId: string, role: string = 'RECRUITER') {
    const existing = await this.prisma.tenantMember.findUnique({
      where: { tenantId_userId: { tenantId, userId } },
    });
    if (existing) throw new ConflictException('该用户已在企业中');
    return this.prisma.tenantMember.create({ data: { tenantId, userId, role: role as any } });
  }

  async removeMember(tenantId: string, userId: string) {
    return this.prisma.tenantMember.delete({ where: { tenantId_userId: { tenantId, userId } } });
  }

  private generateSlug(name: string): string {
    const base = name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '').slice(0, 20);
    return `${base}_${Date.now().toString(36)}`;
  }
}
