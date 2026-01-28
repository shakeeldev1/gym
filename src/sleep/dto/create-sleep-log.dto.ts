import { IsDateString, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSleepLogDto {
  @ApiProperty({
    description: 'Sleep date (ISO)',
    example: '2026-01-28',
    required: true,
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Bedtime (ISO date-time)',
    example: '2026-01-27T23:00:00.000Z',
    required: true,
  })
  @IsDateString()
  bedtime: string;

  @ApiProperty({
    description: 'Wake time (ISO date-time)',
    example: '2026-01-28T06:30:00.000Z',
    required: true,
  })
  @IsDateString()
  wakeTime: string;

  @ApiPropertyOptional({
    description: 'Total sleep duration in hours',
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
  @Min(1)
  @Max(5)
  quality?: number;

  @ApiPropertyOptional({
    description: 'Notes about sleep',
    example: 'Woke up once',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Sleep status',
    enum: ['planned', 'done', 'missed'],
    example: 'done',
  })
  @IsOptional()
  @IsString()
  status?: 'planned' | 'done' | 'missed';
}
