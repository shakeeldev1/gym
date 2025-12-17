import { Module } from '@nestjs/common';
import { NutritionGoalController } from './nutrition-goal.controller';
import { NutritionGoalService } from './nutrition-goal.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NutritionGoal, NutritionGoalSchema } from './schemas/nutrition-goal.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name:NutritionGoal.name,schema:NutritionGoalSchema}])
  ],
  controllers: [NutritionGoalController],
  providers: [NutritionGoalService]
})
export class NutritionGoalModule {}
