"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentTenant = exports.TenantId = void 0;
const common_1 = require("@nestjs/common");
exports.TenantId = (0, common_1.createParamDecorator)((required = true, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    if (required && !request.tenantId) {
        throw new common_1.BadRequestException('请先创建或加入企业');
    }
    return request.tenantId;
});
exports.CurrentTenant = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
});
//# sourceMappingURL=tenant.decorator.js.map