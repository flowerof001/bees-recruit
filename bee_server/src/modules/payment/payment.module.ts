import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { SubscriptionModule } from '../subscription/subscription.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    forwardRef(() => SubscriptionModule),
    forwardRef(() => AuditModule),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
