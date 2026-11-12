import { Test, TestingModule } from '@nestjs/testing';
import { PeriodsController } from './periods.controller.ts';
import { PeriodsService } from './periods.service.ts';

describe('PeriodsController', () => {
  let controller: PeriodsController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeriodsController],
      providers: [{ provide: PeriodsService, useValue: service }],
    }).compile();

    controller = module.get<PeriodsController>(PeriodsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('passes the school header to the service when listing periods', async () => {
    service.findAll.mockResolvedValue({
      data: [],
      total: 0,
      message: 'Periods retrieved successfully.',
      statusCode: 200,
    });

    await controller.findAll(
      {},
      { headers: { schoolid: 'school-1' } } as never,
    );

    expect(service.findAll).toHaveBeenCalledWith({}, 'school-1');
  });
});
