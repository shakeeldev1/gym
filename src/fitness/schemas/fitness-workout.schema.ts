import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FitnessWorkoutDocument = FitnessWorkout & Document;

@Schema({ timestamps: true })
export class FitnessWorkout {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({
    required: true,
    enum: ['fitness', 'yoga', 'cardio', 'hiit', 'stretching', 'fat_loss'],
  })
  category: string;

  @Prop({
    default: 'beginner',
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  difficulty: string;

  @Prop({ default: 30 })
  duration: number; // minutes

  @Prop({ default: 0 })
  caloriesBurn: number;

  @Prop()
  imageUrl: string;

  @Prop()
  videoUrl: string;

  @Prop({ type: [String], default: [] })
  targetMuscles: string[];

  @Prop({ type: [String], default: [] })
  equipment: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  intensity: string; // low, medium, high

  @Prop({ type: [Object], default: [] })
  exercises: {
    name: string;
    sets?: number;
    reps?: string;
    duration?: number;
    restTime?: number;
    imageUrl?: string;
    videoUrl?: string;
    instructions?: string;
  }[];

  @Prop()
  subcategory: string; // e.g., 'tabata', 'emom', 'sun_salutation', 'full_body', etc.

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const FitnessWorkoutSchema = SchemaFactory.createForClass(FitnessWorkout);

// Indexes for efficient querying
FitnessWorkoutSchema.index({ category: 1, difficulty: 1 });
FitnessWorkoutSchema.index({ category: 1, subcategory: 1 });
FitnessWorkoutSchema.index({ isActive: 1, category: 1 });
