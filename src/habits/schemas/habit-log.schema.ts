import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HabitLogDocument = HabitLog & Document;

@Schema({ timestamps: true })
export class HabitLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Habit', required: true })
  habit: Types.ObjectId;

  @Prop({ required: true })
  date: string;

  @Prop({ type: [Number, Boolean], required: true })
  value: boolean | number;
}

export const HabitLogSchema = SchemaFactory.createForClass(HabitLog);
