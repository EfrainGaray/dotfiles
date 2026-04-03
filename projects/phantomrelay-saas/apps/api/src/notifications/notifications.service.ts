import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../common/events/events.service';
import { NotificationType } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  /**
   * Create a notification and emit an SSE event.
   */
  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
  ) {
    const notification = await this.prisma.notification.create({
      data: { userId, type, title, message, link },
    });

    this.events.emit({
      type: 'run.completed', // reuse existing SSE type for now
      data: {
        event: 'notification.created',
        notification: {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          link: notification.link,
          createdAt: notification.createdAt,
        },
      },
    });

    return notification;
  }

  /**
   * List notifications for a user, newest first.
   */
  async findAll(userId: string, unreadOnly?: boolean) {
    const where: Record<string, unknown> = { userId };
    if (unreadOnly) {
      where.read = false;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  /**
   * Mark all notifications as read for a user.
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { updated: result.count };
  }

  /**
   * Get count of unread notifications.
   */
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });

    return { count };
  }

  /**
   * Delete a notification.
   */
  async delete(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({ where: { id } });

    return { deleted: true };
  }

  /**
   * Deliver webhook payloads to all matching ScraperWebhooks.
   * Fire and forget — logs failures but never throws.
   */
  async deliverWebhook(
    scraperId: string,
    event: string,
    payload: Record<string, unknown>,
  ) {
    try {
      const webhooks = await this.prisma.scraperWebhook.findMany({
        where: {
          scraperId,
          enabled: true,
          events: { has: event },
        },
      });

      for (const webhook of webhooks) {
        this.sendWebhook(webhook.url, webhook.secret, payload).catch((err) => {
          this.logger.error(
            `Webhook delivery failed for ${webhook.id} -> ${webhook.url}: ${err.message}`,
          );
        });
      }
    } catch (err) {
      this.logger.error(
        `Failed to query webhooks for scraper ${scraperId}: ${(err as Error).message}`,
      );
    }
  }

  /**
   * POST payload to a webhook URL with HMAC-SHA256 signature.
   */
  private async sendWebhook(
    url: string,
    secret: string,
    payload: Record<string, unknown>,
  ) {
    const body = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature-256': signature,
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }
  }
}
