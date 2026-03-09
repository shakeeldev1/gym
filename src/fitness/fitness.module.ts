import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FitnessController } from './fitness.controller';
import { FitnessService } from './fitness.service';
import {
  FitnessWorkout,
  FitnessWorkoutSchema,
} from './schemas/fitness-workout.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FitnessWorkout.name, schema: FitnessWorkoutSchema },
    ]),
    AuthModule,
  ],
  controllers: [FitnessController],
  providers: [FitnessService],
  exports: [FitnessService],
})
export class FitnessModule {}
