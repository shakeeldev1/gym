import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSleepDto {
  @ApiProperty({
    description: 'Sleep duration in hours',
    example: 7.5,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  durationHours: number;

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
  notes?: string;

  @ApiPropertyOptional({
    description: 'Sleep date (ISO string)',
    example: '2026-01-28T00:00:00.000Z',
  })
  @IsOptional()
  date?: Date;
}
