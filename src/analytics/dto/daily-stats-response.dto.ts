export class CategoryStats {
  category: string;
  completed: number;
  target: number;
  percentage: number;
  remaining: number;
}

export class DailyStatsResponseDto {
  date: string;
  overallCompletion: number;
  categories: CategoryStats[];
  summary: {
    totalActivities: number;
    completedActivities: number;
    pendingActivities: number;
  };
}
