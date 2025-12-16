import { ArrayMinSize, IsDateString, IsEnum, ValidateNested } from "class-validator";
import { MealType } from "../enum/meal-type.enum";
import { Type } from "class-transformer";
import { MealItemDto } from "./meal-item.dto";

export class CreateMealDto {
    @IsEnum(MealType)
    mealType: MealType;

    @IsDateString()
    date: string;

    @ValidateNested({each:true})
    @Type(() =>MealItemDto)
    @ArrayMinSize(1)
    items: MealItemDto[];
}