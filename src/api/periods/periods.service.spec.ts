import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service.ts';
import { PeriodsService } from './periods.service.ts';

const period = {
  id: 'period-1',
  schoolId: 'school-1',
  name: 'Period 1',
  startTime: '08:00',
  endTime: '08:40',
  type: 'PERIOD',
  sortOrder: 1,
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PeriodsService', () => {
  let service: PeriodsService;
  let prisma: {
    period: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      period: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeriodsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PeriodsService>(PeriodsService);
  });

  it('creates a period when the slot does not overlap', async () => {
    prisma.period.findMany.mockResolvedValue([]);
    prisma.period.create.mockResolvedValue(period);

    const response = await service.create(
      {
        name: 'Period 1',
        startTime: '08:00',
        endTime: '08:40',
        sortOrder: 1,
      },
      'school-1',
    );

    expect(response.statusCode).toBe(201);
    expect(prisma.period.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        schoolId: 'school-1',
        name: 'Period 1',
      }),
    });
  });

  it('rejects an end time that is not later than the start time', async () => {
    await expect(
      service.create(
        {
          name: 'Period 1',
          startTime: '09:00',
          endTime: '08:30',
          sortOrder: 1,
        },
        'school-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects overlapping time slots', async () => {
    prisma.period.findMany.mockResolvedValue([
      { name: 'Period 1', startTime: '08:00', endTime: '08:40' },
    ]);

    await expect(
      service.create(
        {
          name: 'Period 2',
          startTime: '08:20',
          endTime: '09:00',
          sortOrder: 2,
        },
        'school-1',
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('lists periods ordered by sort order', async () => {
    prisma.period.findMany.mockResolvedValue([period]);
    prisma.period.count.mockResolvedValue(1);

    const response = await service.findAll({}, 'school-1');

    expect(response.total).toBe(1);
    expect(prisma.period.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ sortOrder: 'asc' }, { startTime: 'asc' }, { id: 'asc' }],
      }),
    );
  });

  it('throws when a period does not exist', async () => {
    prisma.period.findUnique.mockResolvedValue(null);

    await expect(
      service.findOne('missing', 'school-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes an existing period', async () => {
    prisma.period.findUnique.mockResolvedValue({ id: 'period-1' });
    prisma.period.delete.mockResolvedValue(period);

    await service.remove('period-1', 'school-1');

    expect(prisma.period.delete).toHaveBeenCalledWith({
      where: { id: 'period-1' },
    });
  });
});
