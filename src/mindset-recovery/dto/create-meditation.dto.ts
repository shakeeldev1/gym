import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMeditationDto {
  @ApiProperty({
    description: 'Meditation duration in minutes',
    example: 15,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  durationMinutes: number;

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
}
