import { IsMongoId, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class MealItemDto {
    @IsOptional()
    @IsMongoId()
    recipe?:string;

    @IsOptional()
    @IsMongoId()
    food?:string;

    @IsNumber()
    @Min(1)
    quantity:number;
}