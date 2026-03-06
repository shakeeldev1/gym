import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MeditationDocument = Meditation & Document;

@Schema({ timestamps: true })
export class Meditation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  durationMinutes: number;

  @Prop()
  type?: string; // e.g., Mindfulness, Guided

  @Prop()
  notes?: string;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({ enum: ['planned', 'done', 'completed', 'missed', 'skipped'], default: 'planned' })
  status: string;
  @Prop({ default: false })
  isAiGenerated: boolean;

  @Prop({ enum: ['user-created', 'ai-approved', 'ai-pending'], default: 'user-created' })
  source: string;}

export const MeditationSchema = SchemaFactory.createForClass(Meditation);
