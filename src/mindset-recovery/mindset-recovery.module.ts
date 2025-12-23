import { Module } from '@nestjs/common';
import { MindsetRecoveryController } from './mindset-recovery.controller';
import { MindsetRecoveryService } from './mindset-recovery.service';

@Module({
  controllers: [MindsetRecoveryController],
  providers: [MindsetRecoveryService]
})
export class MindsetRecoveryModule {}
