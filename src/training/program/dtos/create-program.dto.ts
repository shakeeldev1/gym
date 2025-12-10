import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateProgramDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coachId?: string;

  @IsOptional()
  @IsArray()
  workouts?: string[];
}