import { IsMongoId, IsOptional, IsArray, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateSessionDto {
  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @IsMongoId()
  user: string;

  @ApiPropertyOptional({
    description: 'Workout block IDs',
    example: ['507f1f77bcf86cd799439012'],
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  blocks?: string[];

  @ApiPropertyOptional({
    description: 'Session notes',
    example: 'Focus on lower body today',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
