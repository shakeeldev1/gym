import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnDemandController } from './on-demand.controller';
import { OnDemandService } from './on-demand.service';
import { OnDemandVideo, OnDemandVideoSchema } from './schemas/on-demand-video.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OnDemandVideo.name, schema: OnDemandVideoSchema },
    ]),
    AuthModule,
  ],
  controllers: [OnDemandController],
  providers: [OnDemandService],
  exports: [OnDemandService],
})
export class OnDemandModule {}
