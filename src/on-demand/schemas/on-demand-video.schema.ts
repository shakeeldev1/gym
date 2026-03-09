import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OnDemandVideoDocument = OnDemandVideo & Document;

@Schema({ timestamps: true })
export class OnDemandVideo {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  videoUrl: string;

  @Prop()
  thumbnailUrl: string;

  @Prop({ required: true, enum: ['Strength', 'Cardio', 'HIIT', 'Yoga', 'Stretching', 'Core', 'Full Body'] })
  category: string;

  @Prop({ default: 'beginner', enum: ['beginner', 'intermediate', 'advanced'] })
  difficulty: string;

  @Prop({ default: 30 })
  duration: number;

  @Prop({ default: 0 })
  caloriesBurn: number;

  @Prop()
  instructor: string;

  @Prop({ type: [String], default: [] })
  equipment: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  viewCount: number;
}

export const OnDemandVideoSchema = SchemaFactory.createForClass(OnDemandVideo);
OnDemandVideoSchema.index({ category: 1, isActive: 1 });
