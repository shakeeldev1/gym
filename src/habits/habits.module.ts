import { Module } from '@nestjs/common';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Habit, HabitSchema } from './schemas/habit.schema';
import { HabitLog, HabitLogSchema } from './schemas/habit-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Habit.name, schema: HabitSchema },
      {name:HabitLog.name, schema:HabitLogSchema}
    ])
  ],
  controllers: [HabitsController],
  providers: [HabitsService]
})
export class HabitsModule { }
