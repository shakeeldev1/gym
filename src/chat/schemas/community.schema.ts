import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommunityDocument = Community & Document;

export enum CommunityType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  ANNOUNCEMENT = 'announcement', // Only admins can post
}

@Schema({ timestamps: true })
export class Community {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId; // Admin who created

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  admins: Types.ObjectId[]; // Community admins

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  members: Types.ObjectId[]; // All members including admins

  @Prop({ enum: CommunityType, default: CommunityType.PRIVATE })
  type: CommunityType;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage?: Types.ObjectId;

  @Prop({ type: Date })
  lastMessageAt?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Map, of: Number, default: {} })
  unreadCount: Map<string, number>; // userId -> unread count

  @Prop({ type: Map, of: Date })
  lastReadAt: Map<string, Date>; // userId -> last read timestamp

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  mutedBy: Types.ObjectId[]; // Users who muted this community

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  bannedUsers: Types.ObjectId[]; // Users banned from community

  @Prop({ type: Object })
  settings?: {
    allowMembersToPost?: boolean;
    allowMembersToAddOthers?: boolean;
    maxMembers?: number;
  };
}

export const CommunitySchema = SchemaFactory.createForClass(Community);

// Indexes
CommunitySchema.index({ name: 1 });
CommunitySchema.index({ createdBy: 1 });
CommunitySchema.index({ members: 1 });
CommunitySchema.index({ isActive: 1 });
CommunitySchema.index({ lastMessageAt: -1 });
