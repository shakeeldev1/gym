import { Module } from '@nestjs/common';
import { MindsetRecoveryController } from './mindset-recovery.controller';
import { MindsetRecoveryService } from './mindset-recovery.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Meditation, MeditationSchema } from './schemas/meditation.schema';
import { Breathwork, BreathworkSchema } from './schemas/breathwork.schema';
import { Sleep, SleepSchema } from './schemas/sleep.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Meditation.name, schema: MeditationSchema },
      { name: Breathwork.name, schema: BreathworkSchema },
      { name: Sleep.name, schema: SleepSchema }
    ])
  ],
  controllers: [MindsetRecoveryController],
  providers: [MindsetRecoveryService]
})
export class MindsetRecoveryModule { }
