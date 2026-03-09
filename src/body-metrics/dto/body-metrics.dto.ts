import {
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBodyMetricsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bodyFatPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  muscleMass?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  waistCircumference?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipCircumference?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  chestCircumference?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  armCircumference?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thighCircumference?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  neckCircumference?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  restingHeartRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  measurementDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class LogWeightDto {
  @ApiProperty()
  @IsNumber()
  weight: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;
}
