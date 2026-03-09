import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BodyMetricsDocument = BodyMetrics & Document;

@Schema({ timestamps: true })
export class BodyMetrics {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop()
  weight: number; // kg

  @Prop()
  height: number; // cm

  @Prop()
  bmi: number;

  @Prop()
  bodyFatPercentage: number;

  @Prop()
  muscleMass: number;

  @Prop()
  waistCircumference: number;

  @Prop()
  hipCircumference: number;

  @Prop()
  chestCircumference: number;

  @Prop()
  armCircumference: number;

  @Prop()
  thighCircumference: number;

  @Prop()
  neckCircumference: number;

  @Prop()
  restingHeartRate: number;

  @Prop({ type: Date, default: Date.now })
  measurementDate: Date;

  @Prop()
  notes: string;
}

export const BodyMetricsSchema = SchemaFactory.createForClass(BodyMetrics);
BodyMetricsSchema.index({ userId: 1, measurementDate: -1 });
