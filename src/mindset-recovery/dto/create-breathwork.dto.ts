import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBreathworkDto {
  @ApiProperty({
    description: 'Breathwork duration in minutes',
    example: 10,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  durationMinutes: number;

  @ApiPropertyOptional({
    description: 'Breathwork type (e.g., box breathing)',
    example: 'box-breathing',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Notes about the session',
    example: 'Used 4-4-4-4 cadence',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Session date (ISO string)',
    example: '2026-01-28T07:30:00.000Z',
  })
  @IsOptional()
  date?: Date;
}
