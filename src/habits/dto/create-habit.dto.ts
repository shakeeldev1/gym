import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateHabitDto {
  @IsString()
  name: string;

  @IsEnum(['BOOLEAN', 'NUMERIC'])
  type: 'BOOLEAN' | 'NUMERIC';

  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @IsString()
  unit?: string;
}
