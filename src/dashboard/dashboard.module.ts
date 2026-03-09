import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Session, SessionSchema } from '../training/session/schemas/session.schema';
import { NutritionGoal, NutritionGoalSchema } from '../nutrition/nutrition-goal/schemas/nutrition-goal.schema';
import { HabitLog, HabitLogSchema } from '../habits/schemas/habit-log.schema';
import { SleepLog, SleepLogSchema } from '../sleep/schemas/sleep-log.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: NutritionGoal.name, schema: NutritionGoalSchema },
      { name: HabitLog.name, schema: HabitLogSchema },
      { name: SleepLog.name, schema: SleepLogSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
