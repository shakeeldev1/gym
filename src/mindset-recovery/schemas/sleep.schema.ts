import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SleepDocument = Sleep & Document;

@Schema({ timestamps: true })
export class Sleep {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  durationHours: number;

  @Prop()
  quality?: number; // 1-5 scale

  @Prop()
  notes?: string;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({ enum: ['planned', 'done', 'missed', 'skipped'], default: 'planned' })
  status: string;
}

export const SleepSchema = SchemaFactory.createForClass(Sleep);
