import { Module } from '@nestjs/common';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Habit, HabitSchema } from './schemas/habit.schema';
import { HabitLog, HabitLogSchema } from './schemas/habit-log.schema';
import { HabitSuggestion, HabitSuggestionSchema } from './schemas/habit-suggestion.schema';
import { DailyResetService } from 'src/common/services/daily-reset.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Habit.name, schema: HabitSchema },
      { name: HabitLog.name, schema: HabitLogSchema },
      { name: HabitSuggestion.name, schema: HabitSuggestionSchema }
    ])
  ],
  controllers: [HabitsController],
  providers: [HabitsService, DailyResetService],
  exports: [HabitsService]
})
export class HabitsModule { }
