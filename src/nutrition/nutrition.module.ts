import { Module } from '@nestjs/common';
import { FoodModule } from './food/food.module';
import { RecipeModule } from './recipe/recipe.module';
import { MealModule } from './meal/meal.module';
import { NutritionLogModule } from './nutrition-log/nutrition-log.module';
import { NutitionLogController } from './nutition-log/nutition-log.controller';

@Module({
  imports: [FoodModule, RecipeModule, MealModule, NutritionLogModule],
  controllers: [NutitionLogController]
})
export class NutritionModule {}
