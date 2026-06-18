import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { AuditService } from '../audit/audit.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private subscriptionService: SubscriptionService,
    private auditService: AuditService,
  ) {}

  /** 创建支付订单 */
  async createOrder(tenantId: string, userId: string, planId: string, method: string = 'WECHAT') {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('套餐不存在');

    const orderNo = `BEE${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const payment = await this.prisma.payment.create({
      data: {
        amount: plan.priceMonthly,
        method: method as any,
        orderNo,
        tenantId,
        userId,
        status: 'PENDING',
      },
    });

    // 支付链接（实际项目需对接微信/支付宝 SDK）
    const payUrl = method === 'WECHAT'
      ? `weixin://wxpay/bizpayurl?pr=${orderNo}`
      : `alipays://platformapi/startapp?appId=20000067&url=pay.example.com%2F${orderNo}`;

    return {
      ...payment,
      payUrl,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(orderNo)}`,
    };
  }

  /** 支付回调处理 */
  async handleCallback(orderNo: string, transactionId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderNo } });
    if (!payment) throw new NotFoundException('订单不存在');
    if (payment.status === 'PAID') throw new BadRequestException('订单已支付');

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderNo },
        data: { status: 'PAID', transactionId, paidAt: new Date() },
      });

      // 激活订阅
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

    // 生成发票
    await this.generateInvoice(payment.id, payment.tenantId);

    return { success: true };
  }

  /** 查询支付状态 */
  async getPaymentStatus(orderNo: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderNo },
      select: { id: true, orderNo: true, status: true, amount: true, method: true, paidAt: true },
    });
    if (!payment) throw new NotFoundException('订单不存在');
    return payment;
  }

  /** 申请退款 */
  async requestRefund(userId: string, orderNo: string, reason?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderNo } });
    if (!payment) throw new NotFoundException('订单不存在');
    if (payment.status !== 'PAID') throw new BadRequestException('仅已支付订单可退款');
    if (payment.userId !== userId) throw new BadRequestException('只能为自己的订单申请退款');

    // 检查是否在7天内
    const paidAt = payment.paidAt ?? payment.createdAt;
    const daysDiff = (Date.now() - paidAt.getTime()) / (86400000);
    if (daysDiff > 7) throw new BadRequestException('超过7天退款期');

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

  /** 租户支付记录 */
  async getPayments(tenantId: string, query?: { page?: number; pageSize?: number; status?: string }) {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const where: any = { tenantId };
    if (query?.status) where.status = query.status;

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where, skip, take: pageSize, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /** 生成发票 */
  async generateInvoice(paymentId: string, tenantId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('订单不存在');

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
    if (!tenant) throw new NotFoundException('企业不存在');

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

  /** 获取租户发票列表 */
  async getInvoices(tenantId: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId },
      include: { payment: { select: { orderNo: true, method: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
