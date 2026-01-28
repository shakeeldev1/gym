import { IsNotEmpty, IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRecipeDto {
  @ApiProperty({
    description: 'Recipe title',
    example: 'Avocado Toast',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Alternate recipe name',
    example: 'Morning Avocado Toast',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Recipe description',
    example: 'Quick breakfast option',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Image URL',
    example: 'https://cdn.example.com/recipes/avocado-toast.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: 'Calories per serving',
    example: 320,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  calories: number;

  @ApiPropertyOptional({
    description: 'Serving size',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  serving?: number;

  @ApiProperty({
    description: 'Protein grams',
    example: 10,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  protein: number;

  @ApiProperty({
    description: 'Carbohydrates grams',
    example: 28,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  carbs: number;

  @ApiProperty({
    description: 'Fat grams',
    example: 18,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  fats: number;

  @ApiProperty({
    description: 'Fibre grams',
    example: 6,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  fibre: number;
}

export class UpdateRecipeDto {
  @ApiPropertyOptional({
    description: 'Recipe title',
    example: 'Avocado Toast',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Alternate recipe name',
    example: 'Morning Avocado Toast',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Recipe description',
    example: 'Quick breakfast option',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Image URL',
    example: 'https://cdn.example.com/recipes/avocado-toast.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Calories per serving',
    example: 320,
  })
  @IsOptional()
  @IsNumber()
  calories?: number;

  @ApiPropertyOptional({
    description: 'Serving size',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  serving?: number;

  @ApiPropertyOptional({
    description: 'Protein grams',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  protein?: number;

  @ApiPropertyOptional({
    description: 'Carbohydrates grams',
    example: 28,
  })
  @IsOptional()
  @IsNumber()
  carbs?: number;

  @ApiPropertyOptional({
    description: 'Fat grams',
    example: 18,
  })
  @IsOptional()
  @IsNumber()
  fats?: number;

  @ApiPropertyOptional({
    description: 'Fibre grams',
    example: 6,
  })
  @IsOptional()
  @IsNumber()
  fibre?: number;

  @ApiPropertyOptional({
    description: 'Whether recipe is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
