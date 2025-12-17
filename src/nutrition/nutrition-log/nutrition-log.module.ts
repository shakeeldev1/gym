import { Module } from '@nestjs/common';
import { NutritionLogController } from './nutrition-log.controller';
import { NutritionLogService } from './nutrition-log.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Meal, MealSchema } from '../meal/schemas/meal.schema';
import { Food, FoodSchema } from '../food/schemas/food.schema';
import { Recipe, RecipeSchema } from '../recipe/schemas/recipe.schema';
import { NutritionGoal, NutritionGoalSchema } from '../nutrition-goal/schemas/nutrition-goal.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name:Meal.name,schema:MealSchema},
      {name:Food.name,schema:FoodSchema},
      {name:Recipe.name,schema:RecipeSchema},
      {name:NutritionGoal.name,schema:NutritionGoalSchema}
    ])
  ],
  controllers: [NutritionLogController],
  providers: [NutritionLogService]
})
export class NutritionLogModule {}
