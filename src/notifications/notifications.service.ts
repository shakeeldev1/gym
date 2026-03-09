import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateNotificationDto,
  BroadcastNotificationDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel('Notification') private notificationModel: Model<any>,
    @InjectModel('User') private userModel: Model<any>,
  ) {}

  async create(dto: CreateNotificationDto) {
    return this.notificationModel.create({
      user: new Types.ObjectId(dto.userId),
      title: dto.title,
      body: dto.body,
      type: dto.type || 'system',
      data: dto.data,
      icon: dto.icon,
    });
  }

  async broadcast(dto: BroadcastNotificationDto) {
    let userIds: Types.ObjectId[];

    if (dto.userIds?.length) {
      userIds = dto.userIds.map((id) => new Types.ObjectId(id));
    } else {
      const users = await this.userModel
        .find({ isActive: { $ne: false } })
        .select('_id')
        .lean();
      userIds = users.map((u: any) => u._id);
    }

    const notifications = userIds.map((userId) => ({
      user: userId,
      title: dto.title,
      body: dto.body,
      type: dto.type || 'broadcast',
      data: dto.data,
    }));

    return this.notificationModel.insertMany(notifications);
  }

  async getUserNotifications(
    userId: string,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const userObjectId = new Types.ObjectId(userId);

    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find({ user: userObjectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.notificationModel.countDocuments({ user: userObjectId }),
      this.notificationModel.countDocuments({
        user: userObjectId,
        isRead: false,
      }),
    ]);

    return {
      data: notifications,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      user: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.notificationModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(notificationId),
        user: new Types.ObjectId(userId),
      },
      { isRead: true },
      { new: true },
    );
  }

  async markAllAsRead(userId: string) {
    return this.notificationModel.updateMany(
      { user: new Types.ObjectId(userId), isRead: false },
      { isRead: true },
    );
  }

  async deleteNotification(notificationId: string, userId: string) {
    return this.notificationModel.findOneAndDelete({
      _id: new Types.ObjectId(notificationId),
      user: new Types.ObjectId(userId),
    });
  }

  async deleteAllUserNotifications(userId: string) {
    return this.notificationModel.deleteMany({
      user: new Types.ObjectId(userId),
    });
  }
}
