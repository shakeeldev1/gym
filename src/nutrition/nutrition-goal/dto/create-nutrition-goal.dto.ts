import { IsDateString, IsEnum, IsNumber, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { GoalType } from "../enum/goal-type.enum";

export class CreateNutritionGoalDto {
    @ApiProperty({
        description: 'Goal type',
        enum: GoalType,
        example: 'MAINTAIN',
        required: true,
    })
    @IsEnum(GoalType)
    goalType: GoalType;

    @ApiProperty({
        description: 'Daily calorie target',
        example: 2200,
        required: true,
    })
    @IsNumber()
    caloriesTarget: number;

    @ApiProperty({
        description: 'Daily protein target (grams)',
        example: 140,
        required: true,
    })
    @IsNumber()
    proteinTarget: number;

    @ApiProperty({
        description: 'Daily carbs target (grams)',
        example: 250,
        required: true,
    })
    @IsNumber()
    carbsTarget: number;

    @ApiProperty({
        description: 'Daily fats target (grams)',
        example: 70,
        required: true,
    })
    @IsNumber()
    fatsTarget: number;

    @ApiProperty({
        description: 'Goal start date (YYYY-MM-DD)',
        example: '2026-01-01',
        required: true,
    })
    @IsDateString({}, { message: 'startDate must be a valid ISO date string (YYYY-MM-DD)' })
    startDate: string;

    @ApiPropertyOptional({
        description: 'Goal end date (YYYY-MM-DD)',
        example: '2026-03-01',
    })
    @IsOptional()
    @IsDateString({}, { message: 'endDate must be a valid ISO date string (YYYY-MM-DD)' })
    endDate?: string;
}