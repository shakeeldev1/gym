import { IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePerformanceDto {
  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @IsMongoId()
  user: string;

  @ApiProperty({
    description: 'Session ID',
    example: '507f1f77bcf86cd799439012',
    required: true,
  })
  @IsMongoId()
  session: string;

  @ApiProperty({
    description: 'Block ID',
    example: '507f1f77bcf86cd799439013',
    required: true,
  })
  @IsMongoId()
  block: string;

  @ApiProperty({
    description: 'Set ID',
    example: '507f1f77bcf86cd799439014',
    required: true,
  })
  @IsMongoId()
  set: string;

  @ApiProperty({
    description: 'Completed reps',
    example: 10,
    required: true,
  })
  @IsNumber()
  completedReps: number;

  @ApiProperty({
    description: 'Completed weight',
    example: 80,
    required: true,
  })
  @IsNumber()
  completedWeight: number;

  @ApiPropertyOptional({
    description: 'Rate of perceived exertion',
    example: 8,
  })
  @IsOptional()
  @IsNumber()
  rpe?: number;

  @ApiPropertyOptional({
    description: 'Notes',
    example: 'Felt strong on last set',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
