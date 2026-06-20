import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { AuditService } from '../audit/audit.service';
export declare class PaymentService {
    private prisma;
    private subscriptionService;
    private auditService;
    constructor(prisma: PrismaService, subscriptionService: SubscriptionService, auditService: AuditService);
    createOrder(tenantId: string, userId: string, planId: string, method?: string): Promise<{
        payUrl: string;
        qrCode: string;
        method: string;
        id: string;
        tenantId: string;
        userId: string;
        createdAt: Date;
        status: string;
        amount: number;
        currency: string;
        orderNo: string;
        transactionId: string | null;
        paidAt: Date | null;
        subscriptionId: string | null;
    }>;
    handleCallback(orderNo: string, transactionId: string): Promise<{
        success: boolean;
    }>;
    getPaymentStatus(orderNo: string): Promise<{
        method: string;
        id: string;
        status: string;
        amount: number;
        orderNo: string;
        paidAt: Date;
    }>;
    requestRefund(userId: string, orderNo: string, reason?: string): Promise<{
        method: string;
        id: string;
        tenantId: string;
        userId: string;
        createdAt: Date;
        status: string;
        amount: number;
        currency: string;
        orderNo: string;
        transactionId: string | null;
        paidAt: Date | null;
        subscriptionId: string | null;
    }>;
    getPayments(tenantId: string, query?: {
        page?: number;
        pageSize?: number;
        status?: string;
    }): Promise<{
        items: {
            method: string;
            id: string;
            tenantId: string;
            userId: string;
            createdAt: Date;
            status: string;
            amount: number;
            currency: string;
            orderNo: string;
            transactionId: string | null;
            paidAt: Date | null;
            subscriptionId: string | null;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    generateInvoice(paymentId: string, tenantId: string): Promise<{
        type: string;
        id: string;
        tenantId: string;
        createdAt: Date;
        status: string;
        title: string;
        amount: number;
        invoiceNo: string;
        taxNo: string | null;
        issuedAt: Date;
        paymentId: string | null;
    }>;
    getInvoices(tenantId: string): Promise<({
        payment: {
            method: string;
            orderNo: string;
        };
    } & {
        type: string;
        id: string;
        tenantId: string;
        createdAt: Date;
        status: string;
        title: string;
        amount: number;
        invoiceNo: string;
        taxNo: string | null;
        issuedAt: Date;
        paymentId: string | null;
    })[]>;
}
