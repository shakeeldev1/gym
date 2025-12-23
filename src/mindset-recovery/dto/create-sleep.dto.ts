import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateSleepDto {
  @IsNotEmpty()
  @IsNumber()
  durationHours: number;

  @IsOptional()
  @IsNumber()
  quality?: number;

  @IsOptional()
  notes?: string;

  @IsOptional()
  date?: Date;
}
