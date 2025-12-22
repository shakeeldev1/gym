import { Test, TestingModule } from '@nestjs/testing';
import { FastingController } from './fasting.controller';

describe('FastingController', () => {
  let controller: FastingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FastingController],
    }).compile();

    controller = module.get<FastingController>(FastingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
