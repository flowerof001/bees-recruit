import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET', 'bee-recruit-secret-key-2026'),
    });
  }

  async validate(payload: any) {
    // Admin 用户
    if (payload.role === 'ADMIN') {
      const admin = await this.prisma.admin.findUnique({ where: { id: payload.sub } });
      if (admin) return { id: admin.id, username: admin.username, role: 'ADMIN', adminRole: admin.role };
      throw new UnauthorizedException('管理员不存在');
    }
    // 普通用户
    const user = await (this.prisma as any).user.findUnique({ where: { id: payload.sub } });
    if (!user || user.status === 'BANNED') {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }
    return { id: user.id, phone: user.phone, role: user.role, nickname: user.nickname };
  }
}
