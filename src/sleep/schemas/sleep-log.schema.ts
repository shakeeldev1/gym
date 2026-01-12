import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SleepLogDocument = SleepLog & Document;

@Schema({ timestamps: true })
export class SleepLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ required: true })
  bedtime: Date; // When user went to bed

  @Prop({ required: true })
  wakeTime: Date; // When user woke up

  @Prop()
  durationHours?: number; // Calculated hours of sleep

  @Prop({ enum: [1, 2, 3, 4, 5], default: 3 })
  quality: number; // 1-5 quality rating

  @Prop()
  notes?: string;

  @Prop({ enum: ['planned', 'done', 'missed'], default: 'done' })
  status: string;
}

export const SleepLogSchema = SchemaFactory.createForClass(SleepLog);
