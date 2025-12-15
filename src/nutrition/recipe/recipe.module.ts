import { Module } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { Recipe, RecipeSchema } from './schemas/recipe.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Recipe.name, schema:RecipeSchema }])
  ],
  controllers: [RecipeController],
  providers: [RecipeService]
})
export class RecipeModule { }
