import { Module, forwardRef } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [forwardRef(() => SubscriptionModule)],
  controllers: [JobController, ApplicationController],
  providers: [JobService, ApplicationService],
  exports: [JobService, ApplicationService],
})
export class JobModule {}
