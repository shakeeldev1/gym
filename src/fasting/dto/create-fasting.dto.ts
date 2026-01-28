import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFastingDto {

  @ApiPropertyOptional({
    description: 'Target fasting duration in hours',
    example: 16,
  })
  @IsOptional()
  @IsNumber()
  goalDurationHours?: number; 

  @ApiPropertyOptional({
    description: 'Goal hours (legacy field)',
    example: 16,
  })
  @IsOptional()
  goalHours?: number;

  @ApiPropertyOptional({
    description: 'Notes for the fasting session',
    example: 'Starting after dinner',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
