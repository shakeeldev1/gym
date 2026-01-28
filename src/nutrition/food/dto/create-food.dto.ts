import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateFoodDto {
    @ApiProperty({
        description: 'Food name',
        example: 'Chicken Breast',
        required: true,
    })
    @IsString()
    name: string;

    @ApiPropertyOptional({
        description: 'Brand name',
        example: 'Generic',
    })
    @IsOptional()
    @IsString()
    brand?: string;

    @ApiProperty({
        description: 'Calories per serving',
        example: 165,
        required: true,
    })
    @IsNumber()
    calories: number;

    @ApiProperty({
        description: 'Protein grams per serving',
        example: 31,
        required: true,
    })
    @IsNumber()
    protein: number;

    @ApiProperty({
        description: 'Carbohydrates grams per serving',
        example: 0,
        required: true,
    })
    @IsNumber()
    carbs: number;

    @ApiProperty({
        description: 'Fat grams per serving',
        example: 3.6,
        required: true,
    })
    @IsNumber()
    fats: number;

    @ApiPropertyOptional({
        description: 'Fiber grams per serving',
        example: 0,
    })
    @IsOptional()
    @IsNumber()
    fiber?: number;

    @ApiPropertyOptional({
        description: 'Sugar grams per serving',
        example: 0,
    })
    @IsOptional()
    @IsNumber()
    sugar?: number;

    @ApiPropertyOptional({
        description: 'Serving size description',
        example: '100 g',
    })
    @IsOptional()
    @IsString()
    servingSize?: string;

    @ApiPropertyOptional({
        description: 'Barcode value if available',
        example: '0123456789012',
    })
    @IsOptional()
    @IsString()
    barcode?: string;

    @ApiPropertyOptional({
        description: 'Tags for search/filtering',
        example: ['protein', 'lean'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    tags?: string[];
}