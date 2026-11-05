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
import { LookupResponseDto } from '../../common/dto/lookup-response.dto.ts';
import { CreateAcademicTermDto } from './dto/create-academic-term.dto.ts';
import {
  AcademicTermFindOneResponseDto,
  AcademicTermsResponseDto,
} from './dto/academic-terms-response.dto.ts';

@Injectable()
export class AcademicTermsService {
  private readonly logger = new Logger(AcademicTermsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateAcademicTermDto,
    schoolId: string,
  ): Promise<AcademicTermFindOneResponseDto> {
    const { name } = dto;

    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }
      if (!name?.trim()) {
        throw new BadRequestException('Term name is required.');
      }

      const normalizedName = name.trim();
      const existingTerm = await this.prisma.academicTerm.findFirst({
        where: { schoolId, name: normalizedName },
        select: { id: true },
      });

      if (existingTerm) {
        throw new ConflictException('Academic term already exists.');
      }

      const academicTerm = await this.prisma.academicTerm.create({
        data: {
          schoolId,
          name: normalizedName,
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Academic term created successfully.',
        data: academicTerm,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Academic term already exists.');
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Invalid school context for academic term.',
        );
      }
      this.handlePrismaError(error);
    }
  }

  async findAll(schoolId: string): Promise<AcademicTermsResponseDto> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const where: Prisma.AcademicTermWhereInput = { schoolId };

      const [academicTerms, total] = await Promise.all([
        this.prisma.academicTerm.findMany({
          where,
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
        }),
        this.prisma.academicTerm.count({ where }),
      ]);

      return {
        data: academicTerms,
        total,
        message: 'Academic terms retrieved successfully.',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to retrieve academic terms.',
      );
    }
  }

  async lookup(schoolId: string): Promise<LookupResponseDto> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const academicTerms = await this.prisma.academicTerm.findMany({
        where: { schoolId },
        select: { id: true, name: true },
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
      });

      return {
        data: academicTerms,
        total: academicTerms.length,
        message: 'Academic term options retrieved successfully.',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to retrieve academic term options.',
      );
    }
  }

  async findOne(
    id: string,
    schoolId: string,
  ): Promise<AcademicTermFindOneResponseDto> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const academicTerm = await this.prisma.academicTerm.findFirst({
        where: { id, schoolId },
      });

      if (!academicTerm) {
        throw new NotFoundException(
          `Academic term with ID "${id}" was not found.`,
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Academic term retrieved successfully.',
        data: academicTerm,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to retrieve academic term.',
      );
    }
  }

  async remove(id: string, schoolId: string): Promise<void> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const academicTerm = await this.prisma.academicTerm.findFirst({
        where: { id, schoolId },
        select: { id: true },
      });

      if (!academicTerm) {
        throw new NotFoundException(
          `Academic term with ID "${id}" was not found.`,
        );
      }

      const assignedTerm = await this.prisma.academicYearTerm.findFirst({
        where: { academicTermId: id },
        select: { id: true },
      });

      if (assignedTerm) {
        throw new ConflictException(
          'Academic term cannot be deleted while it is assigned to an academic year. Remove the assignment first.',
        );
      }

      await this.prisma.academicTerm.delete({ where: { id } });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Academic term with ID "${id}" was not found.`,
        );
      }
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof HttpException) throw error;
    throw new InternalServerErrorException('Academic term operation failed.');
  }
}
