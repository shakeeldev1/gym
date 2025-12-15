import { Module } from '@nestjs/common';
import { FoodModule } from './food/food.module';
import { RecipeModule } from './recipe/recipe.module';

@Module({
  imports: [FoodModule, RecipeModule]
})
export class NutritionModule {}
