import { Module } from '@nestjs/common';
import { FoodModule } from './food/food.module';
import { RecipeModule } from './recipe/recipe.module';
import { MealModule } from './meal/meal.module';
import { NutritionLogModule } from './nutrition-log/nutrition-log.module';
import { NutritionGoalModule } from './nutrition-goal/nutrition-goal.module';

@Module({
  imports: [FoodModule, RecipeModule, MealModule, NutritionLogModule, NutritionGoalModule],
  controllers: []
})
export class NutritionModule {}
