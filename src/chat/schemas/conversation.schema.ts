import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: [Types.ObjectId], ref: 'User', required: true })
  participants: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage?: Types.ObjectId;

  @Prop({ type: Date })
  lastMessageAt?: Date;

  @Prop({ type: Map, of: Number, default: {} })
  unreadCount: Map<string, number>; // userId -> unread count

  @Prop({ type: Map, of: Date })
  lastReadAt: Map<string, Date>; // userId -> last read timestamp

  @Prop({ default: false })
  isArchived: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  archivedBy: Types.ObjectId[]; // Users who archived this conversation

  @Prop({ type: Map, of: Boolean, default: {} })
  isMuted: Map<string, boolean>; // userId -> muted status

  @Prop({ type: Map, of: Boolean, default: {} })
  isBlocked: Map<string, boolean>; // userId -> blocked status
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Indexes
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ 'participants': 1, 'lastMessageAt': -1 });
