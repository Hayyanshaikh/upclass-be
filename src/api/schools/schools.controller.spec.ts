import { Test, TestingModule } from '@nestjs/testing';
import { SchoolsController } from './schools.controller.js';
import { SchoolsService } from './schools.service.js';

describe('SchoolsController', () => {
  let controller: SchoolsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolsController],
      providers: [SchoolsService],
    }).compile();

    controller = module.get<SchoolsController>(SchoolsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
