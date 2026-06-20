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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const subscription_service_1 = require("../subscription/subscription.service");
const audit_service_1 = require("../audit/audit.service");
let PaymentService = class PaymentService {
    constructor(prisma, subscriptionService, auditService) {
        this.prisma = prisma;
        this.subscriptionService = subscriptionService;
        this.auditService = auditService;
    }
    async createOrder(tenantId, userId, planId, method = 'WECHAT') {
        const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        if (!plan)
            throw new common_1.NotFoundException('套餐不存在');
        const orderNo = `BEE${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const payment = await this.prisma.payment.create({
            data: {
                amount: plan.priceMonthly,
                method: method,
                orderNo,
                tenantId,
                userId,
                status: 'PENDING',
            },
        });
        const payUrl = method === 'WECHAT'
            ? `weixin://wxpay/bizpayurl?pr=${orderNo}`
            : `alipays://platformapi/startapp?appId=20000067&url=pay.example.com%2F${orderNo}`;
        return {
            ...payment,
            payUrl,
            qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(orderNo)}`,
        };
    }
    async handleCallback(orderNo, transactionId) {
        const payment = await this.prisma.payment.findUnique({ where: { orderNo } });
        if (!payment)
            throw new common_1.NotFoundException('订单不存在');
        if (payment.status === 'PAID')
            throw new common_1.BadRequestException('订单已支付');
        await this.prisma.$transaction(async (tx) => {
            await tx.payment.update({
                where: { orderNo },
                data: { status: 'PAID', transactionId, paidAt: new Date() },
            });
            const plan = await this.prisma.subscriptionPlan.findFirst({
                where: { priceMonthly: payment.amount },
            });
            if (plan) {
                await this.subscriptionService.activateSubscription(payment.tenantId, plan.id);
            }
        });
        await this.auditService.log({
            tenantId: payment.tenantId, userId: payment.userId,
            action: 'PAYMENT', resource: 'PAYMENT',
            resourceId: payment.id, detail: { orderNo, transactionId, amount: payment.amount },
        });
        await this.generateInvoice(payment.id, payment.tenantId);
        return { success: true };
    }
    async getPaymentStatus(orderNo) {
        const payment = await this.prisma.payment.findUnique({
            where: { orderNo },
            select: { id: true, orderNo: true, status: true, amount: true, method: true, paidAt: true },
        });
        if (!payment)
            throw new common_1.NotFoundException('订单不存在');
        return payment;
    }
    async requestRefund(userId, orderNo, reason) {
        const payment = await this.prisma.payment.findUnique({ where: { orderNo } });
        if (!payment)
            throw new common_1.NotFoundException('订单不存在');
        if (payment.status !== 'PAID')
            throw new common_1.BadRequestException('仅已支付订单可退款');
        if (payment.userId !== userId)
            throw new common_1.BadRequestException('只能为自己的订单申请退款');
        const paidAt = payment.paidAt ?? payment.createdAt;
        const daysDiff = (Date.now() - paidAt.getTime()) / (86400000);
        if (daysDiff > 7)
            throw new common_1.BadRequestException('超过7天退款期');
        const refunded = await this.prisma.payment.update({
            where: { orderNo },
            data: { status: 'REFUNDED' },
        });
        await this.auditService.log({
            tenantId: payment.tenantId, userId,
            action: 'UPDATE', resource: 'PAYMENT',
            resourceId: payment.id, detail: { action: 'REFUND', reason, orderNo },
        });
        return refunded;
    }
    async getPayments(tenantId, query) {
        const page = query?.page ?? 1;
        const pageSize = query?.pageSize ?? 20;
        const skip = (page - 1) * pageSize;
        const where = { tenantId };
        if (query?.status)
            where.status = query.status;
        const [items, total] = await Promise.all([
            this.prisma.payment.findMany({
                where, skip, take: pageSize, orderBy: { createdAt: 'desc' },
            }),
            this.prisma.payment.count({ where }),
        ]);
        return { items, total, page, pageSize };
    }
    async generateInvoice(paymentId, tenantId) {
        const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment)
            throw new common_1.NotFoundException('订单不存在');
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
        if (!tenant)
            throw new common_1.NotFoundException('企业不存在');
        const invoiceNo = `INV-${Date.now().toString(36).toUpperCase()}`;
        const invoice = await this.prisma.invoice.create({
            data: {
                invoiceNo,
                amount: payment.amount,
                title: tenant.name,
                type: 'ELECTRONIC',
                status: 'ISSUED',
                tenantId,
                paymentId,
            },
        });
        return invoice;
    }
    async getInvoices(tenantId) {
        return this.prisma.invoice.findMany({
            where: { tenantId },
            include: { payment: { select: { orderNo: true, method: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        subscription_service_1.SubscriptionService,
        audit_service_1.AuditService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map