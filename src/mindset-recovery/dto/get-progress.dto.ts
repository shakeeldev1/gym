import { IsIn, IsOptional } from 'class-validator';

export class GetMindsetProgressDto {
  @IsIn(['daily', 'weekly', 'monthly'])
  period: 'daily' | 'weekly' | 'monthly';

  @IsOptional()
  date?: string;
}
