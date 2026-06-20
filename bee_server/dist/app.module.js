"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./prisma/prisma.module");
const cache_module_1 = require("./common/cache/cache.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const throttle_guard_1 = require("./common/guards/throttle.guard");
const audit_module_1 = require("./modules/audit/audit.module");
const sms_module_1 = require("./modules/sms/sms.module");
const auth_module_1 = require("./modules/auth/auth.module");
const tenant_module_1 = require("./modules/tenant/tenant.module");
const user_module_1 = require("./modules/user/user.module");
const company_module_1 = require("./modules/company/company.module");
const job_module_1 = require("./modules/job/job.module");
const resume_module_1 = require("./modules/resume/resume.module");
const chat_module_1 = require("./modules/chat/chat.module");
const payment_module_1 = require("./modules/payment/payment.module");
const subscription_module_1 = require("./modules/subscription/subscription.module");
const admin_module_1 = require("./modules/admin/admin.module");
const notification_module_1 = require("./modules/notification/notification.module");
const upload_module_1 = require("./modules/upload/upload.module");
const scheduler_module_1 = require("./modules/scheduler/scheduler.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule, cache_module_1.CacheModule, audit_module_1.AuditModule, sms_module_1.SmsModule, scheduler_module_1.SchedulerModule,
            auth_module_1.AuthModule, tenant_module_1.TenantModule, user_module_1.UserModule, company_module_1.CompanyModule, job_module_1.JobModule,
            resume_module_1.ResumeModule, chat_module_1.ChatModule, payment_module_1.PaymentModule, subscription_module_1.SubscriptionModule,
            admin_module_1.AdminModule, notification_module_1.NotificationModule, upload_module_1.UploadModule,
        ],
        providers: [
            { provide: core_1.APP_FILTER, useClass: http_exception_filter_1.GlobalExceptionFilter },
            { provide: core_1.APP_INTERCEPTOR, useClass: response_interceptor_1.ResponseInterceptor },
            { provide: core_1.APP_INTERCEPTOR, useClass: logging_interceptor_1.LoggingInterceptor },
            { provide: core_1.APP_GUARD, useClass: throttle_guard_1.ThrottleGuard },
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map