import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserPlanProgressDocument = UserPlanProgress & Document;

@Schema({ timestamps: true })
export class UserPlanProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  planId: Types.ObjectId;

  @Prop({ required: true, enum: ['running', 'training'] })
  planType: string;

  @Prop({ default: 'active', enum: ['active', 'paused', 'completed', 'abandoned'] })
  status: string;

  @Prop({ default: 1 })
  currentWeek: number;

  @Prop({ type: [Object], default: [] })
  completedRuns: {
    weekNumber: number;
    day: string;
    completedAt: Date;
    actualDistance?: number;
    actualDuration?: number;
    notes?: string;
  }[];

  @Prop({ type: Date })
  startedAt: Date;

  @Prop({ type: Date })
  completedAt: Date;
}

export const UserPlanProgressSchema = SchemaFactory.createForClass(UserPlanProgress);
UserPlanProgressSchema.index({ userId: 1, planId: 1 }, { unique: true });
