import { Injectable, NestMiddleware, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

export interface TenantRequest extends Request {
  tenantId?: string;
  tenant?: any;
}

function getHeader(req: Request, name: string): string | undefined {
  const val = req.headers[name];
  return Array.isArray(val) ? val[0] : val;
}

function getQuery(req: Request, name: string): string | undefined {
  const val = req.query[name];
  return typeof val === 'string' ? val : undefined;
}

function getParam(req: Request, name: string): string | undefined {
  const val = req.params?.[name];
  return typeof val === 'string' ? val : undefined;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: TenantRequest, _res: Response, next: NextFunction) {
    const tenantId = getParam(req, 'tenantId')
      || getHeader(req, 'x-tenant-id')
      || getQuery(req, 'tenantId');

    if (!tenantId) {
      const token = getHeader(req, 'authorization');
      if (token?.startsWith('Bearer ')) {
        try {
          const decoded = jwt.decode(token.slice(7)) as any;
          if (decoded?.sub) {
            const member = await this.prisma.tenantMember.findFirst({
              where: { userId: decoded.sub },
              select: { tenantId: true, tenant: true },
            });
            if (member) {
              req.tenantId = member.tenantId;
              req.tenant = member.tenant;
            }
          }
        } catch {}
      }
      return next();
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new BadRequestException('企业不存在');
    if (tenant.status === 'SUSPENDED') throw new UnauthorizedException('企业已被停用');

    req.tenantId = tenantId;
    req.tenant = tenant;
    next();
  }
}
