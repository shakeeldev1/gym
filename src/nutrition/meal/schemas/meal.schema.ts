import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MealType } from '../enum/meal-type.enum';

export type MealDocument = Meal & Document;

@Schema({ timestamps: true })
export class Meal {

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ enum: MealType, required: true })
  mealType: MealType;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({
    type: [
      {
        food: { type: Types.ObjectId, ref: 'Food' },
        recipe: { type: Types.ObjectId, ref: 'Recipe' },
        name: { type: String },
        quantity: { type: Number, required: true },
      },
    ],
    required: true,
  })
  items: {
    food?: Types.ObjectId;
    recipe?: Types.ObjectId;
    name?: string;
    quantity: number;
  }[];

  @Prop()
  description?: string;

  @Prop()
  notes?: string;
}

export const MealSchema = SchemaFactory.createForClass(Meal);
