import { Module } from '@nestjs/common';
import { FastingController } from './fasting.controller';
import { FastingService } from './fasting.service';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Fasting, FastingSchema } from './schemas/fasting.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name:Fasting.name,schema:FastingSchema}])
  ],
  controllers: [FastingController],
  providers: [FastingService]
})
export class FastingModule {}
