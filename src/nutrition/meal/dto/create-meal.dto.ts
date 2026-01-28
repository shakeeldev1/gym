import { ArrayMinSize, IsDateString, IsEnum, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { MealType } from "../enum/meal-type.enum";
import { Type } from "class-transformer";
import { MealItemDto } from "./meal-item.dto";

export class CreateMealDto {
    @ApiProperty({
        description: 'Meal type',
        enum: MealType,
        example: 'BREAKFAST',
        required: true,
    })
    @IsEnum(MealType)
    mealType: MealType;

    @ApiProperty({
        description: 'Meal date (ISO)',
        example: '2026-01-28',
        required: true,
    })
    @IsDateString()
    date: string;

    @ApiProperty({
        description: 'Meal items',
        type: [MealItemDto],
        required: true,
    })
    @ValidateNested({each:true})
    @Type(() =>MealItemDto)
    @ArrayMinSize(1)
    items: MealItemDto[];
}