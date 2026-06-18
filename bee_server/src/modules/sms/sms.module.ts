import { Global, Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { AliyunSmsProvider } from './aliyun-sms.provider';
import { TencentSmsProvider } from './tencent-sms.provider';
import { SMS_PROVIDER } from './sms.interface';

@Global()
@Module({
  providers: [
    SmsService,
    AliyunSmsProvider,
    TencentSmsProvider,
    {
      provide: SMS_PROVIDER,
      useClass: AliyunSmsProvider,  // 默认使用阿里云
    },
  ],
  exports: [SmsService],
})
export class SmsModule {}
