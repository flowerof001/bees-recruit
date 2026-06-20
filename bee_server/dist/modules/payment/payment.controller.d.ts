import { PaymentService } from './payment.service';
export declare class PaymentController {
    private paymentService;
    constructor(paymentService: PaymentService);
    createOrder(userId: string, body: {
        tenantId: string;
        planId: string;
        method?: string;
    }): Promise<{
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
    handleCallback(body: {
        orderNo: string;
        transactionId: string;
    }): Promise<{
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
    requestRefund(userId: string, orderNo: string, body?: {
        reason?: string;
    }): Promise<{
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
    getPayments(tenantId: string, query: any): Promise<{
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
