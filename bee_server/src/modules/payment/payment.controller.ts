import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('支付')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('orders')
  @ApiOperation({ summary: '创建支付订单' })
  async createOrder(
    @CurrentUser('id') userId: string,
    @Body() body: { tenantId: string; planId: string; method?: string },
  ) {
    return this.paymentService.createOrder(body.tenantId, userId, body.planId, body.method);
  }

  @Post('callback')
  @ApiOperation({ summary: '支付回调（由支付平台调用）' })
  async handleCallback(@Body() body: { orderNo: string; transactionId: string }) {
    return this.paymentService.handleCallback(body.orderNo, body.transactionId);
  }

  @Get('orders/:orderNo')
  @ApiOperation({ summary: '查询支付状态' })
  async getPaymentStatus(@Param('orderNo') orderNo: string) {
    return this.paymentService.getPaymentStatus(orderNo);
  }

  @Post('orders/:orderNo/refund')
  @ApiOperation({ summary: '申请退款' })
  async requestRefund(
    @CurrentUser('id') userId: string,
    @Param('orderNo') orderNo: string,
    @Body() body?: { reason?: string },
  ) {
    return this.paymentService.requestRefund(userId, orderNo, body?.reason);
  }

  @Get()
  @ApiOperation({ summary: '租户支付记录' })
  async getPayments(
    @Query('tenantId') tenantId: string,
    @Query() query: any,
  ) {
    return this.paymentService.getPayments(tenantId, query);
  }

  @Get('invoices')
  @ApiOperation({ summary: '租户发票列表' })
  async getInvoices(@Query('tenantId') tenantId: string) {
    return this.paymentService.getInvoices(tenantId);
  }
}
