import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SleepController } from './sleep.controller';
import { SleepService } from './sleep.service';
import { SleepLog, SleepLogSchema } from './schemas/sleep-log.schema';
import { DailyResetService } from 'src/common/services/daily-reset.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SleepLog.name, schema: SleepLogSchema },
    ]),
  ],
  controllers: [SleepController],
  providers: [SleepService, DailyResetService],
  exports: [SleepService],
})
export class SleepModule {}
