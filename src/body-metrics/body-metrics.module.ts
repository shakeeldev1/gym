import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BodyMetricsController } from './body-metrics.controller';
import { BodyMetricsService } from './body-metrics.service';
import { BodyMetrics, BodyMetricsSchema } from './schemas/body-metrics.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BodyMetrics.name, schema: BodyMetricsSchema },
    ]),
    AuthModule,
  ],
  controllers: [BodyMetricsController],
  providers: [BodyMetricsService],
  exports: [BodyMetricsService],
})
export class BodyMetricsModule {}
