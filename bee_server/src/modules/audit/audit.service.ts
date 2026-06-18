import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { parsePagination, paginatedResult } from '../../common/helpers/pagination';

export interface AuditEntry {
  tenantId?: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  detail?: Record<string, any>;
  ip?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  /** 记录审计日志 */
  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: entry.tenantId,
          userId: entry.userId,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          detail: entry.detail ?? undefined,
          ip: entry.ip,
        },
      });
    } catch (err) {
      this.logger.error(`审计日志写入失败: ${(err as any).message}`);
    }
  }

  /** 批量记录 */
  async logBatch(entries: AuditEntry[]): Promise<void> {
    if (entries.length === 0) return;
    try {
      await this.prisma.auditLog.createMany({
        data: entries.map(e => ({
          tenantId: e.tenantId, userId: e.userId,
          action: e.action, resource: e.resource,
          resourceId: e.resourceId, detail: e.detail ?? undefined, ip: e.ip,
        })),
      });
    } catch (err) {
      this.logger.error(`批量审计日志写入失败`);
    }
  }

  /** 查询审计日志 */
  async query(params: {
    tenantId?: string; userId?: string; action?: string;
    resource?: string; page?: number; pageSize?: number;
  }) {
    const { skip, take, page, pageSize } = parsePagination(params);
    const where: any = {};
    if (params.tenantId) where.tenantId = params.tenantId;
    if (params.userId) where.userId = params.userId;
    if (params.action) where.action = params.action;
    if (params.resource) where.resource = params.resource;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.auditLog.count({ where }),
    ]);
    return paginatedResult(items, total, page, pageSize);
  }

  /** 登录日志 */
  async logLogin(params: {
    userId: string; method: string; ip?: string;
    userAgent?: string; device?: string; success: boolean; failReason?: string;
  }) {
    await this.prisma.loginLog.create({ data: params });
    await this.log({
      userId: params.userId,
      action: params.success ? 'LOGIN' : 'LOGIN_FAILED',
      resource: 'USER', resourceId: params.userId,
      detail: { method: params.method, device: params.device },
      ip: params.ip,
    });
  }

  /** 查询登录日志 */
  async getLoginLogs(userId: string, query: any) {
    const { skip, take, page, pageSize } = parsePagination(query);
    const [items, total] = await Promise.all([
      this.prisma.loginLog.findMany({
        where: { userId }, skip, take, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.loginLog.count({ where: { userId } }),
    ]);
    return paginatedResult(items, total, page, pageSize);
  }
}
