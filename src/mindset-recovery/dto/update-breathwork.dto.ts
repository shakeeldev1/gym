import { IsOptional, IsNumber, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBreathworkDto {
  @ApiPropertyOptional({
    description: 'Breathwork duration in minutes',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

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

  @ApiPropertyOptional({
    description: 'Status of the breathwork session',
    example: 'completed',
    enum: ['planned', 'completed', 'done', 'missed', 'skipped'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['planned', 'completed', 'done', 'missed', 'skipped'])
  status?: string;
}
