// src/user/user.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserProfileService } from './user-profile.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserProfile, UserProfileSchema } from './schemas/userProfile.schema';
import { UserController } from './user.controller';
import { UserProfileController } from './user-profile.controller';
import { AuthModule } from 'src/auth/auth.module';
import { RecommendationModule } from '../training/recommendation/recommendation.module';
import { HabitsModule } from '../habits/habits.module';
import { Fasting, FastingSchema } from '../fasting/schemas/fasting.schema';
import { Habit, HabitSchema } from '../habits/schemas/habit.schema';
import { HabitLog, HabitLogSchema } from '../habits/schemas/habit-log.schema';
import { Meditation, MeditationSchema } from '../mindset-recovery/schemas/meditation.schema';
import { Sleep, SleepSchema } from '../mindset-recovery/schemas/sleep.schema';
import { Breathwork, BreathworkSchema } from '../mindset-recovery/schemas/breathwork.schema';
import { Meal, MealSchema } from '../nutrition/meal/schemas/meal.schema';
import { NutritionGoal, NutritionGoalSchema } from '../nutrition/nutrition-goal/schemas/nutrition-goal.schema';
import { Session, SessionSchema } from '../training/session/schemas/session.schema';
import { WorkoutBlock, WorkoutBlockSchema } from '../training/workout/schemas/workout-block.schema';
import { WorkoutSet, WorkoutSetSchema } from '../training/workout/schemas/workout-set.schema';
import { Performance, PerformanceSchema } from '../training/performance/schemas/performance.schema';
import { Report, ReportSchema } from '../reports/schemas/report.schema';
import { UserIntegration, UserIntegrationSchema } from '../integrations/schemas/user-integration.schema';
import { Recommendation, RecommendationSchema } from '../training/recommendation/recommendation.schema';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => RecommendationModule),
    HabitsModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserProfile.name, schema: UserProfileSchema },
      { name: Fasting.name, schema: FastingSchema },
      { name: Habit.name, schema: HabitSchema },
      { name: HabitLog.name, schema: HabitLogSchema },
      { name: Meditation.name, schema: MeditationSchema },
      { name: Sleep.name, schema: SleepSchema },
      { name: Breathwork.name, schema: BreathworkSchema },
      { name: Meal.name, schema: MealSchema },
      { name: NutritionGoal.name, schema: NutritionGoalSchema },
      { name: Session.name, schema: SessionSchema },
      { name: WorkoutBlock.name, schema: WorkoutBlockSchema },
      { name: WorkoutSet.name, schema: WorkoutSetSchema },
      { name: Performance.name, schema: PerformanceSchema },
      { name: Report.name, schema: ReportSchema },
      { name: UserIntegration.name, schema: UserIntegrationSchema },
      { name: Recommendation.name, schema: RecommendationSchema },
    ]),
  ],
  providers: [UserService, UserProfileService], 
  exports: [UserService, UserProfileService],
  controllers: [UserController, UserProfileController],
})
export class UserModule {}
