import { Module } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Performance, PerformanceSchema } from './schemas/performance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Performance.name, schema: PerformanceSchema }
    ])
  ],
  providers: [PerformanceService],
  controllers: [PerformanceController]
})
export class PerformanceModule { }
