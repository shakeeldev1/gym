import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ProgressPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class ProgressDto {
  @ApiProperty({
    description: 'Progress period',
    enum: ProgressPeriod,
    example: ProgressPeriod.WEEKLY,
    required: true,
  })
  @IsEnum(ProgressPeriod)
  period: ProgressPeriod;
}
