import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  createCheckout(
    @Request() req: { user: { userId: string } },
    @Body() body: { planId: string },
  ) {
    return this.billingService.createCheckoutSession(req.user.userId, body.planId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscription')
  getSubscription(@Request() req: { user: { userId: string } }) {
    return this.billingService.getSubscription(req.user.userId);
  }

  @Post('webhook')
  handleWebhook(@Body() payload: unknown) {
    return this.billingService.handleWebhook(payload);
  }
}
