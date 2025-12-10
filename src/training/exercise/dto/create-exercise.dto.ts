import { IsArray, IsOptional, IsString } from "class-validator";

export class createExerciseDto {
    @IsString()
    name: string

    @IsOptional()
    @IsArray()
    targetMuscles?: string[];

    @IsOptional()
    @IsArray()
    equipment?: string[];

    @IsOptional()
    @IsString()
    videoUrl?: string;

    @IsOptional()
    @IsString()
    description?: string;
}