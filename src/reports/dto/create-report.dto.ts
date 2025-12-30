import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateReportDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsArray()
  athletes?: string[];

  @IsOptional()
  data?: Record<string, any>;
}
