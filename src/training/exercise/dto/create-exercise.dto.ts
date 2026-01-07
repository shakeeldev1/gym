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
    videoPublicId?: string;

    @IsOptional()
    @IsString()
    posterUrl?: string;

    @IsOptional()
    @IsString()
    posterPublicId?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    difficulty?: string;

    @IsOptional()
    @IsString()
    movementPattern?: string;

    @IsOptional()
    @IsArray()
    contraindications?: string[];

    @IsOptional()
    @IsArray()
    goalTags?: string[];

    @IsOptional()
    @IsArray()
    progressionPath?: string[];
}