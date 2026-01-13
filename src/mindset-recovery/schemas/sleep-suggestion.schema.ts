import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SleepSuggestionDocument = SleepSuggestion & Document;

@Schema({ timestamps: true })
export class SleepSuggestion {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  suggestedBy?: Types.ObjectId; // Admin/Coach who suggested or AI

  @Prop({ type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true })
  status: string;

  @Prop({ required: true })
  durationHours: number;

  @Prop({ min: 1, max: 5 })
  quality?: number;

  @Prop()
  notes?: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ default: true })
  aiGenerated: boolean;

  @Prop()
  reason?: string; // Why AI suggested this sleep schedule

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: Date })
  rejectedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop()
  rejectionReason?: string;

  @Prop()
  adminNotes?: string;
}

export const SleepSuggestionSchema = SchemaFactory.createForClass(SleepSuggestion);
