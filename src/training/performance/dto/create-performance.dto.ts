import { IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePerformanceDto {
  @IsMongoId()
  user: string;

  @IsMongoId()
  session: string;

  @IsMongoId()
  block: string;

  @IsMongoId()
  set: string;

  @IsNumber()
  completedReps: number;

  @IsNumber()
  completedWeight: number;

  @IsOptional()
  @IsNumber()
  rpe?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
