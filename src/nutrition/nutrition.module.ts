import { Module } from '@nestjs/common';
import { FoodModule } from './food/food.module';
import { RecipeModule } from './recipe/recipe.module';
import { MealModule } from './meal/meal.module';

@Module({
  imports: [FoodModule, RecipeModule, MealModule],
  controllers: []
})
export class NutritionModule {}
