import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AcademicYearStatus,
  Prisma,
} from '../../generated/prisma/client.ts';
import { PrismaService } from '../../database/prisma.service.ts';
import { LookupResponseDto } from '../../common/dto/lookup-response.dto.ts';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto.ts';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto.ts';
import {
  AcademicYearFindOneResponseDto,
  AcademicYearsResponseDto,
} from './dto/academic-years-response.dto.ts';

@Injectable()
export class AcademicYearsService {
  private readonly logger = new Logger(AcademicYearsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateAcademicYearDto,
    schoolId: string,
  ): Promise<AcademicYearFindOneResponseDto> {
    const { year, startDate, endDate, status } = dto;

    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }
      if (!year?.trim()) {
        throw new BadRequestException('Academic year is required.');
      }
      if (endDate.getTime() <= startDate.getTime()) {
        throw new BadRequestException(
          'End date must be after the start date.',
        );
      }

      const normalizedYear = year.trim();
      const existingYear = await this.prisma.academicYear.findFirst({
        where: { schoolId, year: normalizedYear },
        select: { id: true },
      });

      if (existingYear) {
        throw new ConflictException('Academic year already exists.');
      }

      const nextStatus = status ?? AcademicYearStatus.ACTIVE;

      if (nextStatus === AcademicYearStatus.ACTIVE) {
        const activeYear = await this.prisma.academicYear.findFirst({
          where: { schoolId, status: AcademicYearStatus.ACTIVE },
          select: { id: true },
        });

        if (activeYear) {
          throw new ConflictException(
            'An active academic year already exists for this school.',
          );
        }
      }

      const academicYear = await this.prisma.academicYear.create({
        data: {
          schoolId,
          year: normalizedYear,
          startDate,
          endDate,
          status: nextStatus,
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Academic year created successfully.',
        data: academicYear,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Academic year already exists or another academic year is already active.',
        );
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Invalid school context for academic year.',
        );
      }
      this.handlePrismaError(error);
    }
  }

  async update(
    id: string,
    schoolId: string,
    dto: UpdateAcademicYearDto,
  ): Promise<AcademicYearFindOneResponseDto> {
    const { year, startDate, endDate, status } = dto;

    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }
      if (year !== undefined && !year.trim()) {
        throw new BadRequestException('Academic year is required.');
      }

      const current = await this.prisma.academicYear.findFirst({
        where: { id, schoolId },
      });

      if (!current) {
        throw new NotFoundException(
          `Academic year with ID "${id}" was not found.`,
        );
      }

      const nextYear = year?.trim() ?? current.year;
      const nextStartDate = startDate ?? current.startDate;
      const nextEndDate = endDate ?? current.endDate;
      const nextStatus = status ?? current.status;

      if (nextEndDate.getTime() <= nextStartDate.getTime()) {
        throw new BadRequestException(
          'End date must be after the start date.',
        );
      }

      if (nextYear !== current.year) {
        const existingYear = await this.prisma.academicYear.findFirst({
          where: { schoolId, year: nextYear, id: { not: id } },
          select: { id: true },
        });

        if (existingYear) {
          throw new ConflictException('Academic year already exists.');
        }
      }

      if (
        nextStatus === AcademicYearStatus.ACTIVE &&
        current.status !== AcademicYearStatus.ACTIVE
      ) {
        const activeYear = await this.prisma.academicYear.findFirst({
          where: {
            schoolId,
            status: AcademicYearStatus.ACTIVE,
            id: { not: id },
          },
          select: { id: true },
        });

        if (activeYear) {
          throw new ConflictException(
            'An active academic year already exists for this school.',
          );
        }
      }

      const academicYear = await this.prisma.academicYear.update({
        where: { id },
        data: {
          year: nextYear,
          startDate: nextStartDate,
          endDate: nextEndDate,
          status: nextStatus,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Academic year updated successfully.',
        data: academicYear,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Academic year already exists or another academic year is already active.',
        );
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Academic year with ID "${id}" was not found.`,
        );
      }
      this.handlePrismaError(error);
    }
  }

  async remove(id: string, schoolId: string): Promise<void> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const academicYear = await this.prisma.academicYear.findFirst({
        where: { id, schoolId },
        select: { id: true },
      });

      if (!academicYear) {
        throw new NotFoundException(
          `Academic year with ID "${id}" was not found.`,
        );
      }

      const assignedTerm = await this.prisma.academicYearTerm.findFirst({
        where: { academicYearId: id },
        select: { id: true },
      });

      if (assignedTerm) {
        throw new ConflictException(
          'Academic year cannot be deleted while terms are assigned. Remove the assigned terms first.',
        );
      }

      await this.prisma.academicYear.delete({ where: { id } });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Academic year with ID "${id}" was not found.`,
        );
      }
      this.handlePrismaError(error);
    }
  }

  async findAll(schoolId: string): Promise<AcademicYearsResponseDto> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const where: Prisma.AcademicYearWhereInput = { schoolId };

      const [academicYears, total] = await Promise.all([
        this.prisma.academicYear.findMany({
          where,
          orderBy: [{ startDate: 'desc' }, { id: 'asc' }],
        }),
        this.prisma.academicYear.count({ where }),
      ]);

      return {
        data: academicYears,
        total,
        message: 'Academic years retrieved successfully.',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to retrieve academic years.',
      );
    }
  }

  async lookup(schoolId: string): Promise<LookupResponseDto> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const academicYears = await this.prisma.academicYear.findMany({
        where: { schoolId },
        select: { id: true, year: true },
        orderBy: [{ startDate: 'desc' }, { id: 'asc' }],
      });

      const data = academicYears.map(({ id, year }) => ({ id, name: year }));

      return {
        data,
        total: data.length,
        message: 'Academic year options retrieved successfully.',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to retrieve academic year options.',
      );
    }
  }

  async findOne(
    id: string,
    schoolId: string,
  ): Promise<AcademicYearFindOneResponseDto> {    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const academicYear = await this.prisma.academicYear.findFirst({
        where: { id, schoolId },
      });

      if (!academicYear) {
        throw new NotFoundException(
          `Academic year with ID "${id}" was not found.`,
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Academic year retrieved successfully.',
        data: academicYear,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to retrieve academic year.',
      );
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof HttpException) throw error;
    throw new InternalServerErrorException('Academic year operation failed.');
  }
}
