import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller';
import { HabitsModule } from 'src/habits/habits.module';
import { SleepModule } from 'src/sleep/sleep.module';

@Module({
  imports: [HabitsModule, SleepModule],
  controllers: [SeedController],
  providers: [],
})
export class SeedModule {}
