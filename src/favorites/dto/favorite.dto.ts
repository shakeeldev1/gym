import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddFavoriteDto {
  @ApiProperty()
  @IsString()
  itemId: string;

  @ApiProperty({ enum: ['workout', 'meal', 'article', 'recipe', 'exercise', 'video'] })
  @IsEnum(['workout', 'meal', 'article', 'recipe', 'exercise', 'video'])
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
