import { IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetMindsetProgressDto {
  @ApiProperty({
    description: 'Aggregation period for progress',
    enum: ['daily', 'weekly', 'monthly'],
    example: 'weekly',
    required: true,
  })
  @IsIn(['daily', 'weekly', 'monthly'])
  period: 'daily' | 'weekly' | 'monthly';

  @ApiPropertyOptional({
    description: 'Reference date (YYYY-MM-DD)',
    example: '2026-01-28',
  })
  @IsOptional()
  date?: string;
}
