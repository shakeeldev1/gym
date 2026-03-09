import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RunningPlanDocument = RunningPlan & Document;

@Schema({ timestamps: true })
export class RunningPlan {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true, enum: ['5K', '10K', 'Half Marathon', 'Marathon'] })
  goal: string;

  @Prop({ default: 'beginner', enum: ['beginner', 'intermediate', 'advanced'] })
  difficulty: string;

  @Prop({ default: 4 })
  durationWeeks: number;

  @Prop({ default: 3 })
  runsPerWeek: number;

  @Prop()
  imageUrl: string;

  @Prop({ type: [Object], default: [] })
  weeks: {
    weekNumber: number;
    runs: {
      day: string;
      type: string; // easy, tempo, interval, long
      distance: number; // km
      duration: number; // minutes
      pace?: string;
      description?: string;
    }[];
  }[];

  @Prop({ default: true })
  isActive: boolean;
}

export const RunningPlanSchema = SchemaFactory.createForClass(RunningPlan);
RunningPlanSchema.index({ goal: 1, difficulty: 1 });
