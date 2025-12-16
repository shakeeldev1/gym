import { Test, TestingModule } from '@nestjs/testing';
import { NutritionLogService } from './nutrition-log.service';

describe('NutritionLogService', () => {
  let service: NutritionLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NutritionLogService],
    }).compile();

    service = module.get<NutritionLogService>(NutritionLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
