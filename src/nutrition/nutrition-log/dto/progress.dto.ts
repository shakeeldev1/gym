import { IsEnum } from 'class-validator';

export enum ProgressPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class ProgressDto {
  @IsEnum(ProgressPeriod)
  period: ProgressPeriod;
}
