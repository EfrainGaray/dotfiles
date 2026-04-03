import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  // TODO: Integrate Resend for email notifications

  async sendEmail(to: string, subject: string, body: string) {
    this.logger.log(`Sending email to ${to}: ${subject}`);
    return { sent: true };
  }

  async notifyRunComplete(userId: string, scraperId: string, runId: string) {
    this.logger.log(`Notifying user ${userId} about run ${runId} completion`);
    return { notified: true };
  }
}
