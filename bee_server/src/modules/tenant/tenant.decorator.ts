import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { TenantRequest } from './tenant.middleware';

/** 从请求中提取 tenantId，招聘方接口强制要求 */
export const TenantId = createParamDecorator((required: boolean = true, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<TenantRequest>();
  if (required && !request.tenantId) {
    throw new BadRequestException('请先创建或加入企业');
  }
  return request.tenantId;
});

export const CurrentTenant = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<TenantRequest>();
  return request.tenant;
});
