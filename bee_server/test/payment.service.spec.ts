import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PaymentService } from '../src/modules/payment/payment.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: any;

  const mockPrisma = {
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    subscriptionPlan: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    subscription: {
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('应该成功创建支付订单', async () => {
      mockPrisma.subscriptionPlan.findUnique.mockResolvedValue({
        id: 'PRO', name: 'PRO', nameCN: '专业版', priceMonthly: 29900,
      });
      mockPrisma.payment.create.mockResolvedValue({
        id: 'pay-1', amount: 29900, orderNo: 'BEE123456', status: 'PENDING',
      });

      const result = await service.createOrder('tenant-1', 'user-1', 'PRO', 'WECHAT');
      expect(result).toHaveProperty('orderNo');
      expect(result).toHaveProperty('payUrl');
      expect(result).toHaveProperty('qrCode');
      expect(result).toHaveProperty('status', 'PENDING');
      expect(mockPrisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ amount: 29900, method: 'WECHAT' }) }),
      );
    });

    it('不存在的套餐应该抛出异常', async () => {
      mockPrisma.subscriptionPlan.findUnique.mockResolvedValue(null);
      await expect(service.createOrder('tenant-1', 'user-1', 'INVALID')).rejects.toThrow(NotFoundException);
    });
  });

  describe('handleCallback', () => {
    it('应该成功处理支付回调并激活订阅', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: 'pay-1', orderNo: 'BEE123456', amount: 29900, tenantId: 'tenant-1',
      });
      mockPrisma.payment.update.mockResolvedValue({});
      mockPrisma.subscriptionPlan.findFirst.mockResolvedValue({ id: 'PRO', priceMonthly: 29900 });
      mockPrisma.subscription.updateMany.mockResolvedValue({});

      const result = await service.handleCallback('BEE123456', 'TXN001');
      expect(result).toEqual({ success: true });
      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PAID', transactionId: 'TXN001' }),
        }),
      );
      expect(mockPrisma.subscription.updateMany).toHaveBeenCalled();
    });

    it('不存在的订单应该抛出异常', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null);
      await expect(service.handleCallback('INVALID', 'TXN001')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPayments', () => {
    it('应该返回支付记录列表', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([
        { id: 'pay-1', amount: 29900, status: 'PAID' },
        { id: 'pay-2', amount: 29900, status: 'PENDING' },
      ]);
      const result = await service.getPayments('tenant-1');
      expect(result).toHaveLength(2);
    });
  });
});
