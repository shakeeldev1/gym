import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PerformanceDocument = Performance & Document;

@Schema({ timestamps: true })
export class Performance {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Session', required: true })
  session: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'WorkoutBlock', required: true })
  block: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'WorkoutSet', required: true })
  set: Types.ObjectId;

  @Prop({ required: true })
  completedReps: number;

  @Prop({ required: true })
  completedWeight: number;

  @Prop()
  rpe?: number;

  @Prop()
  notes?: string;
}

export const PerformanceSchema = SchemaFactory.createForClass(Performance);
