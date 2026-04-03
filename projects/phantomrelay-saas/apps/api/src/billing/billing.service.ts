import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: Stripe | null = null;
  private readonly webhookSecret: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    this.webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET', '');

    if (secretKey) {
      this.stripe = new Stripe(secretKey, { apiVersion: '2025-02-24.acacia' as any });
      this.logger.log('Stripe client initialized');
    } else {
      this.logger.warn(
        'STRIPE_SECRET_KEY not set — billing runs in mock mode',
      );
    }
  }

  async getPlans() {
    return this.prisma.plan.findMany({ orderBy: { price: 'asc' } });
  }

  async createCheckoutSession(userId: string, planName: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { name: planName },
    });
    if (!plan) {
      throw new Error(`Plan "${planName}" not found`);
    }

    if (!this.stripe) {
      this.logger.warn('Mock checkout — Stripe not configured');
      return { url: 'https://checkout.stripe.com/mock-session' };
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const customerId = await this.getOrCreateStripeCustomer(user);

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `PhantomRelay ${plan.name}` },
            unit_amount: plan.price,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      metadata: { userId, planId: plan.id },
      success_url: `${this.config.get('FRONTEND_URL', 'http://localhost:4321')}/dashboard/billing?success=true`,
      cancel_url: `${this.config.get('FRONTEND_URL', 'http://localhost:4321')}/dashboard/billing?canceled=true`,
    });

    return { url: session.url };
  }

  async createPortalSession(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (!this.stripe || !user.stripeCustomerId) {
      this.logger.warn('Mock portal — Stripe not configured or no customer');
      return { url: 'https://billing.stripe.com/mock-portal' };
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${this.config.get('FRONTEND_URL', 'http://localhost:4321')}/dashboard/billing`,
    });

    return { url: session.url };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    if (!this.stripe) {
      this.logger.warn('Webhook received but Stripe not configured');
      return { received: true };
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err}`);
      throw new Error('Invalid webhook signature');
    }

    this.logger.log(`Stripe event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        if (userId && planId) {
          await this.prisma.user.update({
            where: { id: userId },
            data: { planId },
          });
          this.logger.log(`User ${userId} upgraded to plan ${planId}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

        const freePlan = await this.prisma.plan.findUnique({
          where: { name: 'free' },
        });
        if (freePlan) {
          await this.prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { planId: freePlan.id },
          });
          this.logger.log(
            `Customer ${customerId} downgraded to free (subscription deleted)`,
          );
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id;

        if (customerId) {
          const user = await this.prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
          });
          if (user) {
            await this.prisma.notification.create({
              data: {
                userId: user.id,
                type: 'WARNING',
                title: 'Payment failed',
                message:
                  'Your last payment failed. Please update your payment method to avoid service interruption.',
              },
            });
            this.logger.warn(`Payment failed for customer ${customerId}`);
          }
        }
        break;
      }

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  async getCurrentUsage(userId: string) {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { plan: true },
    });

    const usage = await this.prisma.usageRecord.findUnique({
      where: { userId_period: { userId, period } },
    });

    const used = usage?.requests ?? 0;
    const limit = user.plan.requestsPerMonth;

    return {
      used,
      limit,
      percentage: limit > 0 ? Math.round((used / limit) * 100) : 0,
      plan: user.plan.name,
      period,
    };
  }

  async getInvoices(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (!this.stripe || !user.stripeCustomerId) {
      return [];
    }

    const invoices = await this.stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 24,
    });

    return invoices.data.map((inv) => ({
      id: inv.id,
      amount: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      date: inv.created,
      invoiceUrl: inv.hosted_invoice_url,
      pdfUrl: inv.invoice_pdf,
    }));
  }

  // ── Private helpers ──────────────────────────────────────

  private async getOrCreateStripeCustomer(
    user: { id: string; email: string; stripeCustomerId: string | null },
  ): Promise<string> {
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await this.stripe!.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }
}
