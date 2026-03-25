import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateOnDemandDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  difficulty?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  duration?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  caloriesBurn?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  instructor?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  equipment?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
