import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({
    description: 'Report name',
    example: 'Weekly Summary',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Report type',
    example: 'weekly',
    required: true,
  })
  @IsString()
  type: string;

  @ApiPropertyOptional({
    description: 'Athlete user IDs',
    example: ['507f1f77bcf86cd799439011'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  athletes?: string[];

  @ApiPropertyOptional({
    description: 'Custom data payload',
    example: { note: 'Include only active users' },
  })
  @IsOptional()
  data?: Record<string, any>;
}
