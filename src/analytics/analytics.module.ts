import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AnalyticsController } from './analytics.controller'
import { AnalyticsService } from './analytics.service'
import { Fasting, FastingSchema } from '../fasting/schemas/fasting.schema'
import { Habit, HabitSchema } from '../habits/schemas/habit.schema'
import { HabitLog, HabitLogSchema } from '../habits/schemas/habit-log.schema'
import { Session, SessionSchema } from '../training/session/schemas/session.schema'
import { Meal, MealSchema } from '../nutrition/meal/schemas/meal.schema'
import { Meditation, MeditationSchema } from '../mindset-recovery/schemas/meditation.schema'
import { Sleep, SleepSchema } from '../mindset-recovery/schemas/sleep.schema'
import { Breathwork, BreathworkSchema } from '../mindset-recovery/schemas/breathwork.schema'
import { WellnessCronService } from './wellness-cron.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Fasting.name, schema: FastingSchema },
      { name: Habit.name, schema: HabitSchema },
      { name: HabitLog.name, schema: HabitLogSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Meal.name, schema: MealSchema },
      { name: Meditation.name, schema: MeditationSchema },
      { name: Sleep.name, schema: SleepSchema },
      { name: Breathwork.name, schema: BreathworkSchema },
    ])
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, WellnessCronService],
})
export class AnalyticsModule {}
