import { Test, TestingModule } from '@nestjs/testing';
import { NutritionGoalService } from './nutrition-goal.service';

describe('NutritionGoalService', () => {
  let service: NutritionGoalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NutritionGoalService],
    }).compile();

    service = module.get<NutritionGoalService>(NutritionGoalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
