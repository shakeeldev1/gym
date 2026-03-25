import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOnDemandDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  videoUrl: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ enum: ['Strength','Cardio','HIIT','Yoga','Stretching','Core','Full Body'] })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ required: false, enum: ['beginner','intermediate','advanced'] })
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
