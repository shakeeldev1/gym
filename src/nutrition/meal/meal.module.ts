import { Module } from '@nestjs/common';
import { MealController } from './meal.controller';
import { MealService } from './meal.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Meal, MealSchema } from './schemas/meal.schema';
import { DailyResetService } from 'src/common/services/daily-reset.service';

@Module({
  imports: [
    MongooseModule.forFeature([{name:Meal.name,schema:MealSchema}])
  ],
  controllers: [MealController],
  providers: [MealService, DailyResetService]
})
export class MealModule {}
