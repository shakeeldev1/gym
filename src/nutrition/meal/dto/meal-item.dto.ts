import { IsMongoId, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class MealItemDto {
    @ApiPropertyOptional({
        description: 'Recipe ID (if item is a recipe)',
        example: '507f1f77bcf86cd799439011',
    })
    @IsOptional()
    @IsMongoId()
    recipe?:string;

    @ApiPropertyOptional({
        description: 'Food ID (if item is a food)',
        example: '507f1f77bcf86cd799439012',
    })
    @IsOptional()
    @IsMongoId()
    food?:string;

    @ApiProperty({
        description: 'Quantity of the food/recipe',
        example: 2,
        required: true,
    })
    @IsNumber()
    @Min(1)
    quantity:number;
}