import { IsDateString, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateSleepLogDto {
  @IsDateString()
  date: string;

  @IsDateString()
  bedtime: string;

  @IsDateString()
  wakeTime: string;

  @IsOptional()
  @IsNumber()
  durationHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  quality?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  status?: 'planned' | 'done' | 'missed';
}
