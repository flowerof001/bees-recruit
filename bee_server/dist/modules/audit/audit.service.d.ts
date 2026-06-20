import { PrismaService } from '../../prisma/prisma.service';
export interface AuditEntry {
    tenantId?: string;
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    detail?: Record<string, any>;
    ip?: string;
}
export declare class AuditService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    log(entry: AuditEntry): Promise<void>;
    logBatch(entries: AuditEntry[]): Promise<void>;
    query(params: {
        tenantId?: string;
        userId?: string;
        action?: string;
        resource?: string;
        page?: number;
        pageSize?: number;
    }): Promise<import("../../common/helpers/pagination").PaginatedResult<{
        ip: string | null;
        id: string;
        tenantId: string | null;
        userId: string | null;
        action: string;
        resource: string;
        resourceId: string | null;
        detail: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
    }>>;
    logLogin(params: {
        userId: string;
        method: string;
        ip?: string;
        userAgent?: string;
        device?: string;
        success: boolean;
        failReason?: string;
    }): Promise<void>;
    getLoginLogs(userId: string, query: any): Promise<import("../../common/helpers/pagination").PaginatedResult<{
        method: string;
        ip: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        userAgent: string | null;
        device: string | null;
        success: boolean;
        failReason: string | null;
    }>>;
}
