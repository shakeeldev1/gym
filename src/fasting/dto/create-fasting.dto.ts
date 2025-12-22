import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFastingDto {

  @IsOptional()
  @IsNumber()
  goalDurationHours?: number; 

  @IsOptional()
  goalHours?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
