import { Module } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { WorkoutController } from './workout.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkoutBlock, WorkoutBlockSchema } from './schemas/workout-block.schema';
import { WorkoutSet, WorkoutSetSchema } from './schemas/workout-set.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkoutBlock.name, schema: WorkoutBlockSchema },
      { name: WorkoutSet.name, schema: WorkoutSetSchema }
    ])
  ],
  providers: [WorkoutService],
  controllers: [WorkoutController]
})
export class WorkoutModule { }
