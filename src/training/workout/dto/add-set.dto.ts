import { IsNumber, IsOptional, IsBoolean, IsString } from "class-validator";

export class AddSetDto {
    @IsNumber()
    @IsOptional()
    setNumber?: number;

    @IsNumber()
    @IsOptional()
    reps?: number;

    @IsNumber()
    @IsOptional()
    weight?: number;

    @IsNumber()
    @IsOptional()
    repsInReverse?: number;

    @IsNumber()
    @IsOptional()
    restTime?: number;

    @IsOptional()
    tempo?: string;

    @IsBoolean()
    @IsOptional()
    isAMRAP?: boolean;

    @IsNumber()
    @IsOptional()
    autoSuggestedWeight?: number;

    @IsBoolean()
    @IsOptional()
    completed?: boolean;

    @IsString()
    @IsOptional()
    exerciseId?: string;

    @IsString()
    @IsOptional()
    blockId?: string;
}