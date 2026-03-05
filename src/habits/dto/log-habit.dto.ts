import { IsDefined, IsString } from 'class-validator';
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
    description: 'Date for the log entry (YYYY-MM-DD format)',
    example: '2024-01-28',
    required: true
  })
  @IsString()
  date: string;

  @ApiProperty({
    description: 'Value for the habit — true/false for BOOLEAN habits, a number for NUMERIC habits',
    example: true,
    required: true,
    oneOf: [
      { type: 'boolean', example: true },
      { type: 'number', example: 8 }
    ]
  })
  @IsDefined({ message: 'value is required (boolean for BOOLEAN habits, number for NUMERIC habits)' })
  value: boolean | number;
}
