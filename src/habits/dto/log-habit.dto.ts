import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogHabitDto {
  @ApiProperty({
    description: 'Habit ID to log',
    example: '507f1f77bcf86cd799439011',
    required: true
  })
  @IsString()
  habitId: string;

  @ApiProperty({
    description: 'Date for the log entry (ISO format)',
    example: '2024-01-28',
    required: true
  })
  @IsString()
  date: string;

  @ApiProperty({
    description: 'Value for the habit (true/false for BOOLEAN habits, number for NUMERIC habits)',
    example: 8,
    required: true,
    oneOf: [
      { type: 'boolean' },
      { type: 'number' }
    ]
  })
  value: boolean | number;
}
