import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { TrainingModule } from './training/training.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { FastingModule } from './fasting/fasting.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { HabitsModule } from './habits/habits.module';
import { MindsetRecoveryModule } from './mindset-recovery/mindset-recovery.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SleepModule } from './sleep/sleep.module';
import { ReportsModule } from './reports/reports.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SeedModule } from './seed/seed.module';
import { ChatModule } from './chat/chat.module';
import { RedisModule } from './redis/redis.module';
import { WellnessRecipesModule } from './recipes/recipes.module';
import { FitnessModule } from './fitness/fitness.module';
import { BodyMetricsModule } from './body-metrics/body-metrics.module';
import { FavoritesModule } from './favorites/favorites.module';
import { PlansModule } from './plans/plans.module';
import { OnDemandModule } from './on-demand/on-demand.module';
import { CycleModule } from './cycle/cycle.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URL as string),
    ScheduleModule.forRoot(),
    RedisModule,
    TrainingModule,
    NutritionModule,
    FastingModule,
    IntegrationsModule,
    HabitsModule,
    MindsetRecoveryModule,
    AnalyticsModule,
    SleepModule,
    ReportsModule,
    SeedModule,
    ChatModule,
    WellnessRecipesModule,
    FitnessModule,
    BodyMetricsModule,
    FavoritesModule,
    PlansModule,
    OnDemandModule,
    CycleModule,
    DashboardModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
