import { Module } from '@nestjs/common';
import { FoodModule } from './food/food.module';
import { RecipeModule } from './recipe/recipe.module';
import { MealModule } from './meal/meal.module';
import { NutritionLogModule } from './nutrition-log/nutrition-log.module';

@Module({
  imports: [FoodModule, RecipeModule, MealModule, NutritionLogModule],
  controllers: []
})
export class NutritionModule {}
