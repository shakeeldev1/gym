import { IsArray, IsDateString, IsOptional, IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LogPeriodDto {
  @ApiProperty()
  @Transform(({ value }) => {
    if (!value) return value;
    // Accept DD-MM-YYYY or DD/MM/YYYY and convert to ISO YYYY-MM-DD
    const dmy = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/;
    const m = `${value}`.match(dmy);
    if (m) {
      const dd = m[1].padStart(2, '0');
      const mm = m[2].padStart(2, '0');
      const yyyy = m[3];
      return `${yyyy}-${mm}-${dd}`;
    }
    return value;
  })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return value;
    const dmy = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/;
    const m = `${value}`.match(dmy);
    if (m) {
      const dd = m[1].padStart(2, '0');
      const mm = m[2].padStart(2, '0');
      const yyyy = m[3];
      return `${yyyy}-${mm}-${dd}`;
    }
    return value;
  })
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
