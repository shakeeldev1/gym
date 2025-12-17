import { IsDateString, IsEnum, IsNumber, IsOptional } from "class-validator";
import { GoalType } from "../enum/goal-type.enum";

export class CreateNutritionGoalDto {
    @IsEnum(GoalType)
    goalType: GoalType;

    @IsNumber()
    caloriesTarget: number;

    @IsNumber()
    proteinTarget: number;

    @IsNumber()
    carbsTarget: number;

    @IsNumber()
    fatsTarget: number;

    @IsDateString()
    startDate: Date;

    @IsOptional()
    @IsDateString()
    endDate?: Date;
}