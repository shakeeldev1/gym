import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';

export class CreateReportDto {
  @IsString()
  name: string;

  @IsEnum(['monthly', 'quarterly', 'individual', 'team', 'annual'])
  type: string;

  @IsOptional()
  @IsArray()
  athletes?: string[];

  @IsOptional()
  data?: Record<string, any>;
}
