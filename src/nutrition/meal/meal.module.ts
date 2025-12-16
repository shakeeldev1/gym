import { Module } from '@nestjs/common';
import { MealController } from './meal.controller';
import { MealService } from './meal.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Meal, MealSchema } from './schemas/meal.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name:Meal.name,schema:MealSchema}])
  ],
  controllers: [MealController],
  providers: [MealService]
})
export class MealModule {}
