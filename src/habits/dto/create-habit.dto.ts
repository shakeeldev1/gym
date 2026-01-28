import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHabitDto {
  @ApiProperty({
    description: 'Name of the habit',
    example: 'Drink Water',
    required: true
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of habit tracking (BOOLEAN for yes/no, NUMERIC for quantity)',
    enum: ['BOOLEAN', 'NUMERIC'],
    example: 'NUMERIC',
    required: true
  })
  @IsEnum(['BOOLEAN', 'NUMERIC'])
  type: 'BOOLEAN' | 'NUMERIC';

  @ApiProperty({
    description: 'Target value for numeric habits (e.g., 8 glasses of water)',
    example: 8,
    required: false
  })
  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @ApiProperty({
    description: 'Unit of measurement for numeric habits (e.g., glasses, minutes, kilometers)',
    example: 'glasses',
    required: false
  })
  @IsOptional()
  @IsString()
  unit?: string;
}
