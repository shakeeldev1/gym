import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './schemas/session.schema';
import { DailyResetService } from 'src/common/services/daily-reset.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema }
    ])
  ],
  providers: [SessionService, DailyResetService],
  controllers: [SessionController]
})
export class SessionModule { }
