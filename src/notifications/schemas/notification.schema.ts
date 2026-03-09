import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({
    enum: [
      'workout_reminder',
      'meal_reminder',
      'sleep_reminder',
      'hydration_reminder',
      'achievement',
      'community',
      'chat',
      'ai_recommendation',
      'coach_message',
      'system',
      'broadcast',
    ],
    default: 'system',
  })
  type: string;

  @Prop({ default: false, index: true })
  isRead: boolean;

  @Prop({ type: Object })
  data?: Record<string, any>;

  @Prop({ type: String })
  icon?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, isRead: 1 });
