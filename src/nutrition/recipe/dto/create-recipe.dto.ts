import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

class IngredientDto {
  food: string;
  quantity: number;
}

export class CreateRecipeDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsArray()
    ingredients: IngredientDto[];

    @IsOptional()
    tags?: string[];

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;

    @IsOptional()
    createdBy?: string;
}