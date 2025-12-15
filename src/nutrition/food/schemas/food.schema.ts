import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type FoodDocument = Food & Document;

@Schema({timestamps: true})
export class Food {
    @Prop({required: true})
    name: string;

    @Prop()
    brand?: string;

    @Prop({required: true})
    calories: number;

    @Prop({required: true})
    protein: number;

    @Prop({required: true})
    carbs: number;

    @Prop({required: true})
    fats: number;

    @Prop()
    fiber?: number;

    @Prop()
    sugar?: number;

    @Prop()
    servingSize?: string;

    @Prop()
    barcode?: string;

    @Prop({default: []})
    tags?: string[];
}

export const FoodSchema = SchemaFactory.createForClass(Food);
