import { Module } from '@nestjs/common';
import { ExerciseModule } from './exercise/exercise.module';
import { ProgramModule } from './program/program.module';
import { WorkoutModule } from './workout/workout.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [ExerciseModule, ProgramModule, WorkoutModule, SessionModule]
})
export class TrainingModule {}
