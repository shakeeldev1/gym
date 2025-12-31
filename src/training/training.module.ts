import { Module } from '@nestjs/common';
import { ExerciseModule } from './exercise/exercise.module';
import { ProgramModule } from './program/program.module';
import { WorkoutModule } from './workout/workout.module';
import { SessionModule } from './session/session.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Exercise, ExerciseSchema } from './exercise/exercise.schema';
import { Program, ProgramSchema } from './program/program.schema';
import { WorkoutSet, WorkoutSetSchema } from './workout/schemas/workout-set.schema';
import { WorkoutBlock, WorkoutBlockSchema } from './workout/schemas/workout-block.schema';
import { Session, SessionSchema } from './session/schemas/session.schema';
import { PerformanceModule } from './performance/performance.module';
import { Performance, PerformanceSchema } from './performance/schemas/performance.schema';
import { RecommendationModule } from './recommendation/recommendation.module';
import { Recommendation, RecommendationSchema } from './recommendation/recommendation.schema';
import { ExerciseSeedService } from './seed/exercise-seed.service';

@Module({
    imports: [ExerciseModule, ProgramModule, WorkoutModule, SessionModule, RecommendationModule,
        MongooseModule.forFeature([
            { name: Exercise.name, schema: ExerciseSchema },
            { name: Program.name, schema: ProgramSchema },
            { name: WorkoutSet.name, schema: WorkoutSetSchema },
            { name: WorkoutBlock.name, schema: WorkoutBlockSchema },
            { name: Session.name, schema: SessionSchema },
            { name: Performance.name, schema: PerformanceSchema },
            { name: Recommendation.name, schema: RecommendationSchema }
        ]),
        PerformanceModule
    ],
    controllers: [],
    providers: [ExerciseSeedService],
})
export class TrainingModule { }
