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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async dashboard() {
        return this.adminService.getDashboard();
    }
    async getTenants(query) {
        return this.adminService.getTenants(query);
    }
    async getTenant(id) {
        return this.adminService.getTenantDetail(id);
    }
    async updateTenantStatus(id, body, adminId) {
        return this.adminService.updateTenantStatus(id, body.status, adminId);
    }
    async verifyTenant(id, adminId) {
        return this.adminService.verifyTenant(id, adminId);
    }
    async exportTenants() {
        return this.adminService.exportTenants();
    }
    async getUsers(query) {
        return this.adminService.getUsers(query);
    }
    async getUser(id) {
        return this.adminService.getUserDetail(id);
    }
    async updateUserStatus(id, body, adminId) {
        return this.adminService.updateUserStatus(id, body.status, adminId);
    }
    async exportUsers() {
        return this.adminService.exportUsers();
    }
    async getPayments(query) {
        return this.adminService.getAllPayments(query);
    }
    async getAuditLogs(query) {
        return this.adminService.getAuditLogs(query);
    }
    async getLoginLogs(query) {
        return this.adminService.getLoginLogs(query);
    }
    async getConfigs() {
        return this.adminService.getSystemConfigs();
    }
    async getConfig(key) {
        return this.adminService.getSystemConfig(key);
    }
    async setConfig(key, body, adminId) {
        return this.adminService.setSystemConfig(key, body.value, body.description, adminId);
    }
    async deleteConfig(key) {
        return this.adminService.deleteSystemConfig(key);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: '平台数据看板' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('tenants'),
    (0, swagger_1.ApiOperation)({ summary: '租户列表' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTenants", null);
__decorate([
    (0, common_1.Get)('tenants/:id'),
    (0, swagger_1.ApiOperation)({ summary: '租户详情' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTenant", null);
__decorate([
    (0, common_1.Put)('tenants/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: '更新租户状态' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateTenantStatus", null);
__decorate([
    (0, common_1.Post)('tenants/:id/verify'),
    (0, swagger_1.ApiOperation)({ summary: '认证企业' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "verifyTenant", null);
__decorate([
    (0, common_1.Get)('tenants/export'),
    (0, swagger_1.ApiOperation)({ summary: '导出租户数据' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportTenants", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: '用户列表' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: '用户详情' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUser", null);
__decorate([
    (0, common_1.Put)('users/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: '更新用户状态（封禁/解封）' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Get)('users/export'),
    (0, swagger_1.ApiOperation)({ summary: '导出用户数据' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportUsers", null);
__decorate([
    (0, common_1.Get)('payments'),
    (0, swagger_1.ApiOperation)({ summary: '支付记录' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, swagger_1.ApiOperation)({ summary: '审计日志' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('login-logs'),
    (0, swagger_1.ApiOperation)({ summary: '全局登录日志' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getLoginLogs", null);
__decorate([
    (0, common_1.Get)('configs'),
    (0, swagger_1.ApiOperation)({ summary: '系统配置列表' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getConfigs", null);
__decorate([
    (0, common_1.Get)('configs/:key'),
    (0, swagger_1.ApiOperation)({ summary: '获取配置' }),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Put)('configs/:key'),
    (0, swagger_1.ApiOperation)({ summary: '设置配置' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "setConfig", null);
__decorate([
    (0, common_1.Delete)('configs/:key'),
    (0, swagger_1.ApiOperation)({ summary: '删除配置' }),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteConfig", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('管理后台'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map