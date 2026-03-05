import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type HabitLogDocument = HabitLog & Document;

@Schema({ timestamps: true })
export class HabitLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Habit', required: true, index: true })
  habit: Types.ObjectId;

  @Prop({ type: Date, required: true, index: true })
  date: Date;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  value: boolean | number;
}

export const HabitLogSchema = SchemaFactory.createForClass(HabitLog);

// Compound index for efficient queries: find logs by user + habit + date
HabitLogSchema.index({ user: 1, habit: 1, date: 1 }, { unique: true });
