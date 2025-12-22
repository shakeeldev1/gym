import { Test, TestingModule } from '@nestjs/testing';
import { FastingService } from './fasting.service';

describe('FastingService', () => {
  let service: FastingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FastingService],
    }).compile();

    service = module.get<FastingService>(FastingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
