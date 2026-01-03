import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { AIRecommendationService } from './ai-recommendation.service';
import { Exercise, ExerciseSchema } from '../exercise/exercise.schema';
import { UserProfile, UserProfileSchema } from '../../user/schemas/userProfile.schema';
import { Recommendation, RecommendationSchema } from './recommendation.schema';
import { Session, SessionSchema } from '../session/schemas/session.schema';
import { NutritionGoal, NutritionGoalSchema } from '../../nutrition/nutrition-goal/schemas/nutrition-goal.schema';
import { Fasting, FastingSchema } from '../../fasting/schemas/fasting.schema';
import { Sleep, SleepSchema } from '../../mindset-recovery/schemas/sleep.schema';
import { RecoveryPlan, RecoveryPlanSchema } from '../../mindset-recovery/schemas/recovery-plan.schema';
import { WorkoutBlock, WorkoutBlockSchema } from '../workout/schemas/workout-block.schema';
import { WorkoutSet, WorkoutSetSchema } from '../workout/schemas/workout-set.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exercise.name, schema: ExerciseSchema },
      { name: UserProfile.name, schema: UserProfileSchema },
      { name: Recommendation.name, schema: RecommendationSchema },
      { name: Session.name, schema: SessionSchema },
      { name: NutritionGoal.name, schema: NutritionGoalSchema },
      { name: Fasting.name, schema: FastingSchema },
      { name: Sleep.name, schema: SleepSchema },
      { name: RecoveryPlan.name, schema: RecoveryPlanSchema },
      { name: WorkoutBlock.name, schema: WorkoutBlockSchema },
      { name: WorkoutSet.name, schema: WorkoutSetSchema },
    ]),
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService, AIRecommendationService],
  exports: [RecommendationService, AIRecommendationService],
})
export class RecommendationModule {}
