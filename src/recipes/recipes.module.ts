import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WellnessRecipe, WellnessRecipeSchema } from './schemas/recipe.schema';
import { WellnessRecipesService } from './recipes.service';
import { WellnessRecipesController } from './recipes.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'WellnessRecipe', schema: WellnessRecipeSchema }])],
  controllers: [WellnessRecipesController],
  providers: [WellnessRecipesService],
  exports: [WellnessRecipesService],
})
export class WellnessRecipesModule {}
