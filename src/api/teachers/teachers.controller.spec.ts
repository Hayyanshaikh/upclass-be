import { Test, TestingModule } from '@nestjs/testing';
import { TeachersController } from './teachers.controller.ts';
import { TeachersService } from './teachers.service.ts';

describe('TeachersController', () => {
  let controller: TeachersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachersController],
      providers: [TeachersService],
    }).compile();

    controller = module.get<TeachersController>(TeachersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
