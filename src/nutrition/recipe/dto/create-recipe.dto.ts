import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class IngredientDto {
  @ApiProperty({
    description: 'Food ID',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  food: string;

  @ApiProperty({
    description: 'Quantity for the ingredient',
    example: 2,
    required: true,
  })
  quantity: number;
}

export class CreateRecipeDto {
  @ApiProperty({
    description: 'Recipe name',
    example: 'Grilled Chicken Salad',
    required: true,
  })
    @IsString()
    name: string;

  @ApiPropertyOptional({
    description: 'Recipe description',
    example: 'High-protein salad with greens',
  })
    @IsOptional()
    @IsString()
    description?: string;

  @ApiProperty({
    description: 'Ingredients list',
    type: [IngredientDto],
    required: true,
  })
    @IsArray()
    ingredients: IngredientDto[];

  @ApiPropertyOptional({
    description: 'Tags for filtering',
    example: ['high-protein', 'salad'],
    type: [String],
  })
    @IsOptional()
    tags?: string[];

  @ApiPropertyOptional({
    description: 'Whether recipe is public',
    example: true,
  })
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Creator user ID',
    example: '507f1f77bcf86cd799439012',
  })
    @IsOptional()
    createdBy?: string;
}