import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { AIRecommendationService } from './ai-recommendation.service';
import { Exercise, ExerciseSchema } from '../exercise/exercise.schema';
import { UserProfile, UserProfileSchema } from '../../user/schemas/userProfile.schema';
import { Recommendation, RecommendationSchema } from './recommendation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exercise.name, schema: ExerciseSchema },
      { name: UserProfile.name, schema: UserProfileSchema },
      { name: Recommendation.name, schema: RecommendationSchema },
    ]),
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService, AIRecommendationService],
  exports: [RecommendationService, AIRecommendationService],
})
export class RecommendationModule {}
