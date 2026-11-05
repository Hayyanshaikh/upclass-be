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
import { Prisma } from '../../generated/prisma/client.ts';
import { PrismaService } from '../../database/prisma.service.ts';
import { CreateAcademicYearTermDto } from './dto/create-academic-year-term.dto.ts';
import { AcademicYearTermFiltersDto } from './dto/academic-year-term-filters.dto.ts';
import {
  AcademicYearTermFindOneResponseDto,
  AcademicYearTermsResponseDto,
} from './dto/academic-year-terms-response.dto.ts';

const academicYearTermInclude = {
  academicYear: {
    select: { id: true, year: true, startDate: true, endDate: true },
  },
  academicTerm: {
    select: { id: true, name: true },
  },
} satisfies Prisma.AcademicYearTermInclude;

@Injectable()
export class AcademicYearTermsService {
  private readonly logger = new Logger(AcademicYearTermsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateAcademicYearTermDto,
    schoolId: string,
  ): Promise<AcademicYearTermFindOneResponseDto> {
    const { academicYearId, academicTermId, startDate, endDate } = dto;

    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }
      if (!academicYearId?.trim()) {
        throw new BadRequestException('Academic year is required.');
      }
      if (!academicTermId?.trim()) {
        throw new BadRequestException('Academic term is required.');
      }
      if (endDate.getTime() <= startDate.getTime()) {
        throw new BadRequestException(
          'End date must be after the start date.',
        );
      }

      const academicYearTerm = await this.prisma.$transaction(async (tx) => {
        const academicYear = await tx.academicYear.findFirst({
          where: { id: academicYearId, schoolId },
          select: { id: true, startDate: true, endDate: true },
        });

        if (!academicYear) {
          throw new NotFoundException(
            `Academic year with ID "${academicYearId}" was not found.`,
          );
        }

        const academicTerm = await tx.academicTerm.findFirst({
          where: { id: academicTermId, schoolId },
          select: { id: true },
        });

        if (!academicTerm) {
          throw new NotFoundException(
            `Academic term with ID "${academicTermId}" was not found.`,
          );
        }

        if (
          startDate.getTime() < academicYear.startDate.getTime() ||
          endDate.getTime() > academicYear.endDate.getTime()
        ) {
          throw new BadRequestException(
            'Term dates must fall within the academic year date range.',
          );
        }

        const existingAssignment = await tx.academicYearTerm.findFirst({
          where: { academicYearId, academicTermId },
          select: { id: true },
        });

        if (existingAssignment) {
          throw new ConflictException(
            'Academic term is already assigned to this academic year.',
          );
        }

        const overlappingAssignment = await tx.academicYearTerm.findFirst({
          where: {
            academicYearId,
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
          select: { id: true },
        });

        if (overlappingAssignment) {
          throw new ConflictException(
            'Term dates overlap with an existing term in this academic year.',
          );
        }

        return tx.academicYearTerm.create({
          data: {
            academicYearId,
            academicTermId,
            startDate,
            endDate,
          },
          include: academicYearTermInclude,
        });
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Academic term assigned successfully.',
        data: academicYearTerm,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Academic term is already assigned to this academic year.',
        );
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Invalid academic year or academic term context.',
        );
      }
      this.handlePrismaError(error);
    }
  }

  async findAll(
    query: AcademicYearTermFiltersDto,
    schoolId: string,
  ): Promise<AcademicYearTermsResponseDto> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const where: Prisma.AcademicYearTermWhereInput = {
        academicYear: { schoolId },
        ...(query.academicYearId
          ? { academicYearId: query.academicYearId }
          : {}),
      };

      const [academicYearTerms, total] = await Promise.all([
        this.prisma.academicYearTerm.findMany({
          where,
          include: academicYearTermInclude,
          orderBy: [{ startDate: 'asc' }, { id: 'asc' }],
        }),
        this.prisma.academicYearTerm.count({ where }),
      ]);

      return {
        data: academicYearTerms,
        total,
        message: 'Academic year terms retrieved successfully.',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to retrieve academic year terms.',
      );
    }
  }

  async remove(id: string, schoolId: string): Promise<void> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      await this.prisma.$transaction(async (tx) => {
        const assignment = await tx.academicYearTerm.findFirst({
          where: { id, academicYear: { schoolId } },
          select: { id: true },
        });

        if (!assignment) {
          throw new NotFoundException(
            `Academic year term with ID "${id}" was not found.`,
          );
        }

        await tx.academicYearTerm.delete({ where: { id } });
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Academic year term with ID "${id}" was not found.`,
        );
      }
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof HttpException) throw error;
    throw new InternalServerErrorException(
      'Academic year term operation failed.',
    );
  }
}
