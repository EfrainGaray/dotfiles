import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  RawBody,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  getPlans() {
    return this.billingService.getPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  createCheckout(
    @Request() req: { user: { userId: string } },
    @Body() body: { planName: string },
  ) {
    return this.billingService.createCheckoutSession(
      req.user.userId,
      body.planName,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('portal')
  createPortal(@Request() req: { user: { userId: string } }) {
    return this.billingService.createPortalSession(req.user.userId);
  }

  @Post('webhook')
  handleWebhook(
    @RawBody() rawBody: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    return this.billingService.handleWebhook(rawBody, signature);
  }

  @UseGuards(JwtAuthGuard)
  @Get('usage')
  getUsage(@Request() req: { user: { userId: string } }) {
    return this.billingService.getCurrentUsage(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('invoices')
  getInvoices(@Request() req: { user: { userId: string } }) {
    return this.billingService.getInvoices(req.user.userId);
  }
}
