import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MenstrualCycleDocument = MenstrualCycle & Document;

@Schema({ timestamps: true })
export class MenstrualCycle {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Date })
  lastPeriodStart: Date;

  @Prop({ type: Date })
  lastPeriodEnd: Date;

  @Prop({ default: 28 })
  cycleLength: number;

  @Prop({ default: 5 })
  periodLength: number;

  @Prop({ type: [Object], default: [] })
  periodLogs: {
    startDate: Date;
    endDate?: Date;
    flow?: string; // light, medium, heavy
    notes?: string;
  }[];

  @Prop({ type: [Object], default: [] })
  symptomLogs: {
    date: Date;
    symptoms: string[];
    severity?: string; // mild, moderate, severe
    notes?: string;
  }[];
}

export const MenstrualCycleSchema = SchemaFactory.createForClass(MenstrualCycle);
MenstrualCycleSchema.index({ userId: 1 }, { unique: true });
