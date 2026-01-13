import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { AIRecommendationService } from './ai-recommendation.service';
import { AIDataPopulatorService } from './ai-data-populator.service';
import { Exercise, ExerciseSchema } from '../exercise/exercise.schema';
import { UserProfile, UserProfileSchema } from '../../user/schemas/userProfile.schema';
import { Recommendation, RecommendationSchema } from './recommendation.schema';
import { Session, SessionSchema } from '../session/schemas/session.schema';
import { NutritionGoal, NutritionGoalSchema } from '../../nutrition/nutrition-goal/schemas/nutrition-goal.schema';
import { Fasting, FastingSchema } from '../../fasting/schemas/fasting.schema';
import { Sleep, SleepSchema } from '../../mindset-recovery/schemas/sleep.schema';
import { Breathwork, BreathworkSchema } from '../../mindset-recovery/schemas/breathwork.schema';
import { Meditation, MeditationSchema } from '../../mindset-recovery/schemas/meditation.schema';
import { SleepSuggestion, SleepSuggestionSchema } from '../../mindset-recovery/schemas/sleep-suggestion.schema';
import { MeditationSuggestion, MeditationSuggestionSchema } from '../../mindset-recovery/schemas/meditation-suggestion.schema';
import { BreathworkSuggestion, BreathworkSuggestionSchema } from '../../mindset-recovery/schemas/breathwork-suggestion.schema';
import { RecoveryPlan, RecoveryPlanSchema } from '../../mindset-recovery/schemas/recovery-plan.schema';
import { Meal, MealSchema } from '../../nutrition/meal/schemas/meal.schema';
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
      { name: Breathwork.name, schema: BreathworkSchema },
      { name: Meditation.name, schema: MeditationSchema },
      { name: SleepSuggestion.name, schema: SleepSuggestionSchema },
      { name: MeditationSuggestion.name, schema: MeditationSuggestionSchema },
      { name: BreathworkSuggestion.name, schema: BreathworkSuggestionSchema },
      { name: RecoveryPlan.name, schema: RecoveryPlanSchema },
      { name: Meal.name, schema: MealSchema },
      { name: WorkoutBlock.name, schema: WorkoutBlockSchema },
      { name: WorkoutSet.name, schema: WorkoutSetSchema },
    ]),
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService, AIRecommendationService, AIDataPopulatorService],
  exports: [RecommendationService, AIRecommendationService, AIDataPopulatorService],
})
export class RecommendationModule {}
