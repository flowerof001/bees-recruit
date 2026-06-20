export interface SmsProvider {
    sendVerificationCode(phone: string, code: string, ttlMinutes: number): Promise<boolean>;
    sendNotification(phone: string, templateCode: string, params: Record<string, string>): Promise<boolean>;
    checkBalance(): Promise<number>;
}
export declare const SMS_PROVIDER = "SMS_PROVIDER";
