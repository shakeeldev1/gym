import { IsArray, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class createExerciseDto {
    @ApiProperty({
        description: 'Exercise name',
        example: 'Bench Press',
        required: true,
    })
    @IsString()
    name: string

    @ApiPropertyOptional({
        description: 'Target muscle groups',
        example: ['chest', 'triceps'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    targetMuscles?: string[];

    @ApiPropertyOptional({
        description: 'Required equipment',
        example: ['barbell', 'bench'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    equipment?: string[];

    @ApiPropertyOptional({
        description: 'Video URL',
        example: 'https://cdn.example.com/exercises/bench-press.mp4',
    })
    @IsOptional()
    @IsString()
    videoUrl?: string;

    @ApiPropertyOptional({
        description: 'Video public ID',
        example: 'exercise_videos/bench-press',
    })
    @IsOptional()
    @IsString()
    videoPublicId?: string;

    @ApiPropertyOptional({
        description: 'Poster image URL',
        example: 'https://cdn.example.com/exercises/bench-press.jpg',
    })
    @IsOptional()
    @IsString()
    posterUrl?: string;

    @ApiPropertyOptional({
        description: 'Poster public ID',
        example: 'exercise_posters/bench-press',
    })
    @IsOptional()
    @IsString()
    posterPublicId?: string;

    @ApiPropertyOptional({
        description: 'Exercise description',
        example: 'Compound chest exercise performed with a barbell',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Difficulty level',
        example: 'intermediate',
    })
    @IsOptional()
    @IsString()
    difficulty?: string;

    @ApiPropertyOptional({
        description: 'Movement pattern',
        example: 'push',
    })
    @IsOptional()
    @IsString()
    movementPattern?: string;

    @ApiPropertyOptional({
        description: 'Contraindications',
        example: ['shoulder injury'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    contraindications?: string[];

    @ApiPropertyOptional({
        description: 'Goal tags',
        example: ['strength', 'hypertrophy'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    goalTags?: string[];

    @ApiPropertyOptional({
        description: 'Progression path exercise IDs',
        example: ['507f1f77bcf86cd799439011'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    progressionPath?: string[];
}