import { IsOptional, IsNumber, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMeditationDto {
  @ApiPropertyOptional({
    description: 'Meditation duration in minutes',
    example: 15,
  })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Meditation type (e.g., mindfulness, breathing)',
    example: 'mindfulness',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Notes about the session',
    example: 'Felt calmer after session',
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
    description: 'Status of the meditation session',
    example: 'completed',
    enum: ['planned', 'completed', 'done', 'missed', 'skipped'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['planned', 'completed', 'done', 'missed', 'skipped'])
  status?: string;
}
