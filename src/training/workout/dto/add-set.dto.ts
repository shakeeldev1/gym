import { IsNumber, IsOptional, IsBoolean, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class AddSetDto {
    @ApiPropertyOptional({
        description: 'Set number',
        example: 1,
    })
    @IsNumber()
    @IsOptional()
    setNumber?: number;

    @ApiPropertyOptional({
        description: 'Reps',
        example: 10,
    })
    @IsNumber()
    @IsOptional()
    reps?: number;

    @ApiPropertyOptional({
        description: 'Weight',
        example: 60,
    })
    @IsNumber()
    @IsOptional()
    weight?: number;

    @ApiPropertyOptional({
        description: 'Reps in reverse',
        example: 8,
    })
    @IsNumber()
    @IsOptional()
    repsInReverse?: number;

    @ApiPropertyOptional({
        description: 'Rest time (seconds)',
        example: 90,
    })
    @IsNumber()
    @IsOptional()
    restTime?: number;

    @ApiPropertyOptional({
        description: 'Tempo',
        example: '3-1-1',
    })
    @IsOptional()
    tempo?: string;

    @ApiPropertyOptional({
        description: 'AMRAP flag',
        example: false,
    })
    @IsBoolean()
    @IsOptional()
    isAMRAP?: boolean;

    @ApiPropertyOptional({
        description: 'Auto suggested weight',
        example: 55,
    })
    @IsNumber()
    @IsOptional()
    autoSuggestedWeight?: number;

    @ApiPropertyOptional({
        description: 'Set completion status',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    completed?: boolean;

    @ApiPropertyOptional({
        description: 'Exercise ID',
        example: '507f1f77bcf86cd799439011',
    })
    @IsString()
    @IsOptional()
    exerciseId?: string;

    @ApiPropertyOptional({
        description: 'Block ID',
        example: '507f1f77bcf86cd799439012',
    })
    @IsString()
    @IsOptional()
    blockId?: string;
}