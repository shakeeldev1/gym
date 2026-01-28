import { ApiProperty } from '@nestjs/swagger';

export class CategoryStats {
  @ApiProperty({ description: 'Category name', example: 'sleep' })
  category: string;

  @ApiProperty({ description: 'Completed count', example: 1 })
  completed: number;

  @ApiProperty({ description: 'Target count', example: 1 })
  target: number;

  @ApiProperty({ description: 'Completion percentage', example: 100 })
  percentage: number;

  @ApiProperty({ description: 'Remaining count', example: 0 })
  remaining: number;
}

export class DailyStatsResponseDto {
  @ApiProperty({ description: 'Date (YYYY-MM-DD)', example: '2026-01-28' })
  date: string;

  @ApiProperty({ description: 'Overall completion percentage', example: 75 })
  overallCompletion: number;

  @ApiProperty({ description: 'Category stats', type: [CategoryStats] })
  categories: CategoryStats[];

  @ApiProperty({
    description: 'Summary totals',
    example: {
      totalActivities: 8,
      completedActivities: 6,
      pendingActivities: 2,
    },
  })
  summary: {
    totalActivities: number;
    completedActivities: number;
    pendingActivities: number;
  };
}
