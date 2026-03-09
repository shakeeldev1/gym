import { IsArray, IsDateString, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LogPeriodDto {
  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  flow?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class LogSymptomsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  symptoms: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  severity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCycleSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cycleLength?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  periodLength?: number;
}
