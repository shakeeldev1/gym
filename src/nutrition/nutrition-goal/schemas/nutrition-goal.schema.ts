import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Document } from "mongoose";
import { GoalType } from "../enum/goal-type.enum";

export type NutritionGoalDocument = NutritionGoal & Document;

@Schema({ timestamps: true })
export class NutritionGoal {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ enum: GoalType, required: true })
    goalType: GoalType;

    @Prop({ required: true })
    caloriesTarget: number;

    @Prop({ required: true })
    proteinTarget: number;

    @Prop({ required: true })
    carbsTarget: number;

    @Prop({ required: true })
    fatsTarget: number;

    @Prop({ type: Date, required: true })
    startDate: Date;

    @Prop({ type: Date })
    endDate?: Date;

    @Prop({ default: true })
    isActive: boolean;
}

export const NutritionGoalSchema = SchemaFactory.createForClass(NutritionGoal);