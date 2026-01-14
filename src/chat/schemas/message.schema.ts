import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

export enum MessageType {
  TEXT = 'text',
  VOICE = 'voice',
  IMAGE = 'image',
  VIDEO = 'video',
  FILE = 'file',
  SYSTEM = 'system',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  recipient?: Types.ObjectId; // For one-on-one chats

  @Prop({ type: Types.ObjectId, ref: 'Community', index: true })
  community?: Types.ObjectId; // For community chats

  @Prop({ type: Types.ObjectId, ref: 'Conversation', index: true })
  conversation?: Types.ObjectId; // For one-on-one conversation reference

  @Prop({ enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @Prop()
  content?: string; // Text content

  @Prop()
  mediaUrl?: string; // URL for voice notes, images, files

  @Prop()
  mediaDuration?: number; // Duration in seconds for voice notes

  @Prop()
  mediaSize?: number; // File size in bytes

  @Prop()
  mimeType?: string; // MIME type for media files

  @Prop({ enum: MessageStatus, default: MessageStatus.SENT })
  status: MessageStatus;

  @Prop({ type: Date })
  deliveredAt?: Date;

  @Prop({ type: Date })
  readAt?: Date;

  @Prop({ default: false })
  isBroadcast: boolean; // True if it's a broadcast message

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  broadcastRecipients?: Types.ObjectId[]; // List of recipients for broadcast

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  replyTo?: Types.ObjectId; // Reference to message being replied to

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>; // Additional metadata
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Indexes for performance
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, createdAt: -1 });
MessageSchema.index({ community: 1, createdAt: -1 });
MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ status: 1 });
