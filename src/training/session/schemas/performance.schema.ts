import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PerformanceRecordDocument = PerformanceRecord & Document;

@Schema({ timestamps: true })
export class PerformanceRecord {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Exercise', required: true })
  exerciseId: Types.ObjectId;

  @Prop()
  bestWeight?: number;

  @Prop()
  bestReps?: number;

  @Prop()
  lastUpdated?: Date;
}

export const PerformanceRecordSchema = SchemaFactory.createForClass(PerformanceRecord);
