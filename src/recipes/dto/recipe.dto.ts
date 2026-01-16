import { IsNotEmpty, IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';

export class CreateRecipeDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsNotEmpty()
  @IsNumber()
  calories: number;

  @IsOptional()
  @IsNumber()
  serving?: number;

  @IsNotEmpty()
  @IsNumber()
  protein: number;

  @IsNotEmpty()
  @IsNumber()
  carbs: number;

  @IsNotEmpty()
  @IsNumber()
  fats: number;

  @IsNotEmpty()
  @IsNumber()
  fibre: number;
}

export class UpdateRecipeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  calories?: number;

  @IsOptional()
  @IsNumber()
  serving?: number;

  @IsOptional()
  @IsNumber()
  protein?: number;

  @IsOptional()
  @IsNumber()
  carbs?: number;

  @IsOptional()
  @IsNumber()
  fats?: number;

  @IsOptional()
  @IsNumber()
  fibre?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
