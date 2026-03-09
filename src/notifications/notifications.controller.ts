import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Req,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  BroadcastNotificationDto,
} from './dto/notification.dto';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.getUserNotifications(
      req.user.sub,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.sub);
    return { data: { unreadCount: count } };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const notification = await this.notificationsService.markAsRead(
      id,
      req.user.sub,
    );
    return { data: notification };
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: any) {
    await this.notificationsService.markAllAsRead(req.user.sub);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @Req() req: any) {
    await this.notificationsService.deleteNotification(id, req.user.sub);
    return { message: 'Notification deleted' };
  }

  @Delete()
  async deleteAll(@Req() req: any) {
    await this.notificationsService.deleteAllUserNotifications(req.user.sub);
    return { message: 'All notifications deleted' };
  }

  // Admin endpoints
  @Post()
  async createNotification(@Body() dto: CreateNotificationDto) {
    const notification = await this.notificationsService.create(dto);
    return { data: notification };
  }

  @Post('broadcast')
  async broadcastNotification(@Body() dto: BroadcastNotificationDto) {
    const notifications = await this.notificationsService.broadcast(dto);
    return { data: { sent: notifications.length } };
  }
}
