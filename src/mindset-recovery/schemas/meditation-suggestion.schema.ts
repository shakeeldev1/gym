import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MeditationSuggestionDocument = MeditationSuggestion & Document;

@Schema({ timestamps: true })
export class MeditationSuggestion {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  suggestedBy?: Types.ObjectId;

  @Prop({ type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true })
  status: string;

  @Prop({ required: true })
  durationMinutes: number;

  @Prop()
  type?: string;

  @Prop()
  notes?: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ default: true })
  aiGenerated: boolean;

  @Prop()
  reason?: string;

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

export const MeditationSuggestionSchema = SchemaFactory.createForClass(MeditationSuggestion);
