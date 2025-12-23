import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BreathworkDocument = Breathwork & Document;

@Schema({ timestamps: true })
export class Breathwork {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  durationMinutes: number;

  @Prop()
  type?: string; // e.g., Box breathing, 4-7-8

  @Prop()
  notes?: string;

  @Prop({ default: Date.now })
  date: Date;
}

export const BreathworkSchema = SchemaFactory.createForClass(Breathwork);
