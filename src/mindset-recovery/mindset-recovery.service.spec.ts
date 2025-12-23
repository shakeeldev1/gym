import { Test, TestingModule } from '@nestjs/testing';
import { MindsetRecoveryService } from './mindset-recovery.service';

describe('MindsetRecoveryService', () => {
  let service: MindsetRecoveryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MindsetRecoveryService],
    }).compile();

    service = module.get<MindsetRecoveryService>(MindsetRecoveryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
