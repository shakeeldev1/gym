import { IsOptional, IsNumber, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSleepDto {
  @ApiPropertyOptional({
    description: 'Sleep duration in hours',
    example: 7.5,
  })
  @IsOptional()
  @IsNumber()
  durationHours?: number;

  @ApiPropertyOptional({
    description: 'Sleep quality rating (1-5)',
    example: 4,
  })
  @IsOptional()
  @IsNumber()
  quality?: number;

  @ApiPropertyOptional({
    description: 'Notes about sleep',
    example: 'Woke up once at 3am',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Sleep date (ISO string)',
    example: '2026-01-28T00:00:00.000Z',
  })
  @IsOptional()
  date?: Date;

  @ApiPropertyOptional({
    description: 'Status of the sleep session',
    example: 'completed',
    enum: ['planned', 'completed', 'done', 'missed', 'skipped'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['planned', 'completed', 'done', 'missed', 'skipped'])
  status?: string;
}
