import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class CreateMeditationDto {
  @IsNotEmpty()
  @IsNumber()
  durationMinutes: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  date?: Date;
}
