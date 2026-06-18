export interface SmsProvider {
  /** 发送短信验证码 */
  sendVerificationCode(phone: string, code: string, ttlMinutes: number): Promise<boolean>;
  /** 发送通知短信 */
  sendNotification(phone: string, templateCode: string, params: Record<string, string>): Promise<boolean>;
  /** 检查余额 */
  checkBalance(): Promise<number>;
}

export const SMS_PROVIDER = 'SMS_PROVIDER';
