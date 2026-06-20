"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const application_service_1 = require("./application.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const tenant_decorator_1 = require("../tenant/tenant.decorator");
const application_dto_1 = require("./dto/application.dto");
class BatchUpdateDto {
}
let ApplicationController = class ApplicationController {
    constructor(applicationService) {
        this.applicationService = applicationService;
    }
    async apply(dto, userId, jobId) {
        return this.applicationService.apply(userId, jobId, dto.resumeId, dto.message);
    }
    async getMine(userId, query) {
        return this.applicationService.getMyApplications(userId, query);
    }
    async getByJob(jobId, query, tenantId) {
        return this.applicationService.getByJob(jobId, tenantId, query);
    }
    async updateStatus(id, dto, tenantId, operatorId) {
        return this.applicationService.updateStatus(id, tenantId, dto.status, operatorId);
    }
    async batchUpdate(dto, tenantId) {
        return this.applicationService.batchUpdateStatus(dto.ids, tenantId, dto.status);
    }
};
exports.ApplicationController = ApplicationController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '投递简历' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [application_dto_1.ApplyJobDto, String, String]),
    __metadata("design:returntype", Promise)
], ApplicationController.prototype, "apply", null);
__decorate([
    (0, common_1.Get)('mine'),
    (0, swagger_1.ApiOperation)({ summary: '我的投递记录' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationController.prototype, "getMine", null);
__decorate([
    (0, common_1.Get)('job/:jobId'),
    (0, swagger_1.ApiOperation)({ summary: '岗位收到的投递列表（招聘方）' }),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, tenant_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ApplicationController.prototype, "getByJob", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: '更新投递状态' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_decorator_1.TenantId)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, application_dto_1.UpdateApplicationDto, String, String]),
    __metadata("design:returntype", Promise)
], ApplicationController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)('batch/status'),
    (0, swagger_1.ApiOperation)({ summary: '批量更新投递状态' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BatchUpdateDto, String]),
    __metadata("design:returntype", Promise)
], ApplicationController.prototype, "batchUpdate", null);
exports.ApplicationController = ApplicationController = __decorate([
    (0, swagger_1.ApiTags)('投递管理'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('applications'),
    __metadata("design:paramtypes", [application_service_1.ApplicationService])
], ApplicationController);
//# sourceMappingURL=application.controller.js.map