import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { RunningPlan, RunningPlanSchema } from './schemas/running-plan.schema';
import { TrainingPlan, TrainingPlanSchema } from './schemas/training-plan.schema';
import { UserPlanProgress, UserPlanProgressSchema } from './schemas/user-plan-progress.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RunningPlan.name, schema: RunningPlanSchema },
      { name: TrainingPlan.name, schema: TrainingPlanSchema },
      { name: UserPlanProgress.name, schema: UserPlanProgressSchema },
    ]),
    AuthModule,
  ],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
