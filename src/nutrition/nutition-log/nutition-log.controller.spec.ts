import { Test, TestingModule } from '@nestjs/testing';
import { NutitionLogController } from './nutition-log.controller';

describe('NutitionLogController', () => {
  let controller: NutitionLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NutitionLogController],
    }).compile();

    controller = module.get<NutitionLogController>(NutitionLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
