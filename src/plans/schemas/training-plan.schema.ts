import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TrainingPlanDocument = TrainingPlan & Document;

@Schema({ timestamps: true })
export class TrainingPlan {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true, enum: ['gym', 'home'] })
  type: string;

  @Prop({ default: 'beginner', enum: ['beginner', 'intermediate', 'advanced'] })
  level: string;

  @Prop({ default: '8 weeks' })
  duration: string;

  @Prop({ default: 3 })
  daysPerWeek: number;

  @Prop({ default: 'Full Gym' })
  equipment: string;

  @Prop({ type: [String], default: [] })
  focus: string[];

  @Prop()
  imageUrl: string;

  @Prop({ type: [Object], default: [] })
  weeks: {
    weekNumber: number;
    days: {
      day: string;
      exercises: {
        name: string;
        sets: number;
        reps: string;
        rest: string;
        notes?: string;
      }[];
    }[];
  }[];

  @Prop({ default: true })
  isActive: boolean;
}

export const TrainingPlanSchema = SchemaFactory.createForClass(TrainingPlan);
TrainingPlanSchema.index({ type: 1, level: 1 });
