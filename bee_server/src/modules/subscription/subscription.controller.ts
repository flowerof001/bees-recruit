import { Controller, Get, Post, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../tenant/tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('订阅')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Public()
  @Get('plans')
  @ApiOperation({ summary: '获取所有订阅套餐' })
  async getPlans() {
    return this.subscriptionService.getPlans();
  }

  @Public()
  @Get('plans/:id')
  @ApiOperation({ summary: '套餐详情' })
  async getPlan(@Param('id') id: string) {
    return this.subscriptionService.getPlan(id);
  }

  @Post('subscribe')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '订阅/切换套餐' })
  async subscribe(@Body() body: { planId: string }, @TenantId() tenantId: string) {
    return this.subscriptionService.subscribe(tenantId, body.planId);
  }

  @Get('current')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '当前订阅状态' })
  async getCurrent(@TenantId() tenantId: string) {
    return this.subscriptionService.getCurrentSubscription(tenantId);
  }

  @Get('history')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '订阅历史' })
  async getHistory(@TenantId() tenantId: string) {
    return this.subscriptionService.getSubscriptionHistory(tenantId);
  }
}
