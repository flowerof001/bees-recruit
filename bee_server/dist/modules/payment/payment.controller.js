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
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payment_service_1 = require("./payment.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let PaymentController = class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async createOrder(userId, body) {
        return this.paymentService.createOrder(body.tenantId, userId, body.planId, body.method);
    }
    async handleCallback(body) {
        return this.paymentService.handleCallback(body.orderNo, body.transactionId);
    }
    async getPaymentStatus(orderNo) {
        return this.paymentService.getPaymentStatus(orderNo);
    }
    async requestRefund(userId, orderNo, body) {
        return this.paymentService.requestRefund(userId, orderNo, body?.reason);
    }
    async getPayments(tenantId, query) {
        return this.paymentService.getPayments(tenantId, query);
    }
    async getInvoices(tenantId) {
        return this.paymentService.getInvoices(tenantId);
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('orders'),
    (0, swagger_1.ApiOperation)({ summary: '创建支付订单' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('callback'),
    (0, swagger_1.ApiOperation)({ summary: '支付回调（由支付平台调用）' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "handleCallback", null);
__decorate([
    (0, common_1.Get)('orders/:orderNo'),
    (0, swagger_1.ApiOperation)({ summary: '查询支付状态' }),
    __param(0, (0, common_1.Param)('orderNo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getPaymentStatus", null);
__decorate([
    (0, common_1.Post)('orders/:orderNo/refund'),
    (0, swagger_1.ApiOperation)({ summary: '申请退款' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('orderNo')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "requestRefund", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '租户支付记录' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Get)('invoices'),
    (0, swagger_1.ApiOperation)({ summary: '租户发票列表' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getInvoices", null);
exports.PaymentController = PaymentController = __decorate([
    (0, swagger_1.ApiTags)('支付'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map