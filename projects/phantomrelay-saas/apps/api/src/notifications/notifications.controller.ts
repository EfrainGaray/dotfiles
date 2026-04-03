import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /notifications?unreadOnly=true
   */
  @Get()
  findAll(
    @CurrentUser() user: JwtUser,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationsService.findAll(
      user.userId,
      unreadOnly === 'true',
    );
  }

  /**
   * GET /notifications/unread-count
   */
  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: JwtUser) {
    return this.notificationsService.getUnreadCount(user.userId);
  }

  /**
   * PATCH /notifications/:id/read
   */
  @Patch(':id/read')
  markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.notificationsService.markAsRead(id, user.userId);
  }

  /**
   * POST /notifications/mark-all-read
   */
  @Post('mark-all-read')
  markAllAsRead(@CurrentUser() user: JwtUser) {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  /**
   * DELETE /notifications/:id
   */
  @Delete(':id')
  delete(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.notificationsService.delete(id, user.userId);
  }
}
