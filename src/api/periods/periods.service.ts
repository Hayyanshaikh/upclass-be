import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.ts';
import {
  PeriodStatus,
  PeriodType,
} from '../../generated/prisma/client.ts';
import { PrismaService } from '../../database/prisma.service.ts';
import { CreatePeriodDto } from './dto/create-period.dto.ts';
import { UpdatePeriodDto } from './dto/update-period.dto.ts';
import { FindPeriodsQueryDto } from './dto/find-periods-query.dto.ts';
import {
  PeriodFindOneResponseDto,
  PeriodsResponseDto,
} from './dto/periods-response.dto.ts';

@Injectable()
export class PeriodsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreatePeriodDto,
    schoolId: string,
  ): Promise<PeriodFindOneResponseDto> {
    const { name, startTime, endTime, type, sortOrder, status } = dto;

    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }
      if (!name?.trim()) {
        throw new BadRequestException('Period name is required.');
      }

      this.validateTimeRange(startTime, endTime);
      await this.ensureNoOverlap(schoolId, startTime, endTime);

      const period = await this.prisma.period.create({
        data: {
          schoolId,
          name: name.trim(),
          startTime,
          endTime,
          type: type ?? PeriodType.PERIOD,
          sortOrder,
          status: status ?? PeriodStatus.ACTIVE,
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Period created successfully.',
        data: period,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A period with this name already exists.');
      }
      this.handlePrismaError(error);
    }
  }

  async findAll(
    query: FindPeriodsQueryDto,
    schoolId: string,
  ): Promise<PeriodsResponseDto> {
    const { status, type, searchKey, limit = 10, offset = 0 } = query;
    const where: Prisma.PeriodWhereInput = {
      schoolId,
      ...(status && { status }),
      ...(type && { type }),
      ...(searchKey && {
        name: { contains: searchKey, mode: 'insensitive' },
      }),
    };

    try {
      const [data, total] = await Promise.all([
        this.prisma.period.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: [
            { sortOrder: 'asc' },
            { startTime: 'asc' },
            { id: 'asc' },
          ],
        }),
        this.prisma.period.count({ where }),
      ]);

      return {
        data,
        total,
        message: 'Periods retrieved successfully.',
        statusCode: HttpStatus.OK,
      };
    } catch {
      throw new InternalServerErrorException('Failed to retrieve periods.');
    }
  }

  async findOne(
    id: string,
    schoolId: string,
  ): Promise<PeriodFindOneResponseDto> {
    try {
      const period = await this.prisma.period.findUnique({
        where: { id, schoolId },
      });

      if (!period) {
        throw new NotFoundException(`Period with ID "${id}" was not found.`);
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Period retrieved successfully.',
        data: period,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve period.');
    }
  }

  async update(
    id: string,
    schoolId: string,
    dto: UpdatePeriodDto,
  ): Promise<PeriodFindOneResponseDto> {
    try {
      if (dto.name !== undefined && !dto.name.trim()) {
        throw new BadRequestException('Period name is required.');
      }

      const current = await this.prisma.period.findUnique({
        where: { id, schoolId },
      });

      if (!current) {
        throw new NotFoundException(`Period with ID "${id}" was not found.`);
      }

      const startTime = dto.startTime ?? current.startTime;
      const endTime = dto.endTime ?? current.endTime;

      this.validateTimeRange(startTime, endTime);
      await this.ensureNoOverlap(schoolId, startTime, endTime, id);

      const period = await this.prisma.period.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          startTime: dto.startTime,
          endTime: dto.endTime,
          type: dto.type,
          sortOrder: dto.sortOrder,
          status: dto.status,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Period updated successfully.',
        data: period,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A period with this name already exists.');
      }
      this.handlePrismaError(error, id);
    }
  }

  async remove(id: string, schoolId: string): Promise<void> {
    try {
      const period = await this.prisma.period.findUnique({
        where: { id, schoolId },
        select: { id: true },
      });

      if (!period) {
        throw new NotFoundException(`Period with ID "${id}" was not found.`);
      }

      await this.prisma.period.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Period with ID "${id}" was not found.`);
      }
      this.handlePrismaError(error, id);
    }
  }

  private validateTimeRange(startTime: string, endTime: string): void {
    if (this.toMinutes(startTime) >= this.toMinutes(endTime)) {
      throw new BadRequestException(
        'End time must be later than start time.',
      );
    }
  }

  private async ensureNoOverlap(
    schoolId: string,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ): Promise<void> {
    const start = this.toMinutes(startTime);
    const end = this.toMinutes(endTime);

    const periods = await this.prisma.period.findMany({
      where: {
        schoolId,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: {
        name: true,
        startTime: true,
        endTime: true,
      },
    });

    const conflict = periods.find(
      (period) =>
        start < this.toMinutes(period.endTime) &&
        this.toMinutes(period.startTime) < end,
    );

    if (conflict) {
      throw new ConflictException(
        `Time slot overlaps with "${conflict.name}" (${conflict.startTime}-${conflict.endTime}).`,
      );
    }
  }

  private toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private handlePrismaError(error: unknown, id?: string): never {
    if (error instanceof HttpException) throw error;
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException(`Period with ID "${id}" was not found.`);
    }
    throw new InternalServerErrorException('Period operation failed.');
  }
}
