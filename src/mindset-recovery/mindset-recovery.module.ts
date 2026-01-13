import { Module } from '@nestjs/common';
import { MindsetRecoveryController } from './mindset-recovery.controller';
import { MindsetRecoveryService } from './mindset-recovery.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Meditation, MeditationSchema } from './schemas/meditation.schema';
import { Breathwork, BreathworkSchema } from './schemas/breathwork.schema';
import { Sleep, SleepSchema } from './schemas/sleep.schema';
import { RecoveryPlan, RecoveryPlanSchema } from './schemas/recovery-plan.schema';
import { SleepSuggestion, SleepSuggestionSchema } from './schemas/sleep-suggestion.schema';
import { MeditationSuggestion, MeditationSuggestionSchema } from './schemas/meditation-suggestion.schema';
import { BreathworkSuggestion, BreathworkSuggestionSchema } from './schemas/breathwork-suggestion.schema';
import { DailyResetService } from 'src/common/services/daily-reset.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Meditation.name, schema: MeditationSchema },
      { name: Breathwork.name, schema: BreathworkSchema },
      { name: Sleep.name, schema: SleepSchema },
      { name: RecoveryPlan.name, schema: RecoveryPlanSchema },
      { name: SleepSuggestion.name, schema: SleepSuggestionSchema },
      { name: MeditationSuggestion.name, schema: MeditationSuggestionSchema },
      { name: BreathworkSuggestion.name, schema: BreathworkSuggestionSchema }
    ])
  ],
  controllers: [MindsetRecoveryController],
  providers: [MindsetRecoveryService, DailyResetService],
  exports: [MindsetRecoveryService]
})
export class MindsetRecoveryModule { }
