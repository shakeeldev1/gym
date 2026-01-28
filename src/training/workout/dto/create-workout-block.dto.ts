import { IsEnum, IsOptional, IsArray, IsMongoId, IsNumber } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { BlockType } from "../enums/blocktype.enum";

export class CreateWorkoutBlockDto {
  @ApiPropertyOptional({
    description: 'Workout block type',
    enum: BlockType,
    example: 'STANDARD',
  })
  @IsEnum(BlockType)
  @IsOptional()
  type?: BlockType;

  @ApiPropertyOptional({
    description: 'Exercise IDs',
    example: ['507f1f77bcf86cd799439011'],
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  exercises?: string[];

  @ApiPropertyOptional({
    description: 'Rest between exercises (seconds)',
    example: 90,
  })
  @IsNumber()
  @IsOptional()
  restBetweenExercises?: number;
}
