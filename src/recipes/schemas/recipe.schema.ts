import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WellnessRecipeDocument = WellnessRecipe & Document;

// Dedicated collection and model name to avoid collisions with nutrition recipes
@Schema({ collection: 'app_recipes', timestamps: true })
export class WellnessRecipe {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ required: true })
  calories: number; // per serving

  @Prop({ default: 1 })
  serving: number;

  @Prop({ required: true })
  protein: number; // in grams

  @Prop({ required: true })
  carbs: number; // in grams

  @Prop({ required: true })
  fats: number; // in grams

  @Prop({ required: true })
  fibre: number; // in grams

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  ingredients: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId; // Admin/Coach who created

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId; // Last admin/coach who edited

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  metadata?: Record<string, any>; // Additional fields
}

export const WellnessRecipeSchema = SchemaFactory.createForClass(WellnessRecipe);

// Indexes for performance
WellnessRecipeSchema.index({ createdBy: 1, createdAt: -1 });
WellnessRecipeSchema.index({ title: 'text', description: 'text' });
WellnessRecipeSchema.index({ isActive: 1 });
