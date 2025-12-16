import { Module } from '@nestjs/common';
import { NutritionLogService } from './nutrition-log.service';

@Module({
  providers: [NutritionLogService]
})
export class NutritionLogModule {}
