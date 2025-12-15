import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type RecipeDocument = Recipe & Document;

@Schema({ timestamps: true })
export class RecipeIngredient {
    @Prop({ type: Types.ObjectId, ref: 'Food', required: true })
    food: Types.ObjectId;

    @Prop({ required: true })
    quantity: number;
}

@Schema({ timestamps: true })
export class Recipe {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ type: [RecipeIngredient], default: [] })
    ingredients: RecipeIngredient[];

    @Prop({default:[]})
    tags: string[];

    @Prop({default:false})
    isPublic: boolean;

    @Prop({type:Types.ObjectId,ref:'User',required:true})
    createdBy?: Types.ObjectId;
    
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);