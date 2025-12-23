import { Test, TestingModule } from '@nestjs/testing';
import { MindsetRecoveryController } from './mindset-recovery.controller';

describe('MindsetRecoveryController', () => {
  let controller: MindsetRecoveryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MindsetRecoveryController],
    }).compile();

    controller = module.get<MindsetRecoveryController>(MindsetRecoveryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
