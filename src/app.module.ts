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

@Module({
  imports: [AuthModule,
    UserModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URL as string),
    TrainingModule,
    NutritionModule,
    FastingModule,
    IntegrationsModule,
    HabitsModule,
    MindsetRecoveryModule,
    AnalyticsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
