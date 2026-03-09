import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CycleController } from './cycle.controller';
import { CycleService } from './cycle.service';
import { MenstrualCycle, MenstrualCycleSchema } from './schemas/menstrual-cycle.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenstrualCycle.name, schema: MenstrualCycleSchema },
    ]),
    AuthModule,
  ],
  controllers: [CycleController],
  providers: [CycleService],
  exports: [CycleService],
})
export class CycleModule {}
