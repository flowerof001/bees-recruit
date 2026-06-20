import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
export interface TenantRequest extends Request {
    tenantId?: string;
    tenant?: any;
}
export declare class TenantMiddleware implements NestMiddleware {
    private prisma;
    constructor(prisma: PrismaService);
    use(req: TenantRequest, _res: Response, next: NextFunction): Promise<void>;
}
