import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './common/cache/cache.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ThrottleGuard } from './common/guards/throttle.guard';
import { AuditModule } from './modules/audit/audit.module';
import { SmsModule } from './modules/sms/sms.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UserModule } from './modules/user/user.module';
import { CompanyModule } from './modules/company/company.module';
import { JobModule } from './modules/job/job.module';
import { ResumeModule } from './modules/resume/resume.module';
import { ChatModule } from './modules/chat/chat.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationModule } from './modules/notification/notification.module';
import { UploadModule } from './modules/upload/upload.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, CacheModule, AuditModule, SmsModule, SchedulerModule,
    AuthModule, TenantModule, UserModule, CompanyModule, JobModule,
    ResumeModule, ChatModule, PaymentModule, SubscriptionModule,
    AdminModule, NotificationModule, UploadModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_GUARD, useClass: ThrottleGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
