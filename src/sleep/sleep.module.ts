import { Module } from '@nestjs/common'
import { SleepController } from './sleep.controller'

@Module({
  controllers: [SleepController],
})
export class SleepModule {}
