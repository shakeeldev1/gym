import { Test, TestingModule } from '@nestjs/testing';
import { NutritionLogController } from './nutrition-log.controller';

describe('NutritionLogController', () => {
  let controller: NutritionLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NutritionLogController],
    }).compile();

    controller = module.get<NutritionLogController>(NutritionLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
