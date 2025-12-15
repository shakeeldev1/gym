import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateFoodDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    brand?: string;

    @IsNumber()
    calories: number;

    @IsNumber()
    protein: number;

    @IsNumber()
    carbs: number;

    @IsNumber()
    fats: number;

    @IsOptional()
    @IsNumber()
    fiber?: number;

    @IsOptional()
    @IsNumber()
    sugar?: number;

    @IsOptional()
    @IsString()
    servingSize?: string;

    @IsOptional()
    @IsString()
    barcode?: string;

    @IsOptional()
    @IsArray()
    tags?: string[];
}