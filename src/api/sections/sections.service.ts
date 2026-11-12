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
import { PrismaService } from '../../database/prisma.service.ts';
import { CreateSectionDto } from './dto/create-section.dto.ts';
import { UpdateSectionDto } from './dto/update-section.dto.ts';
import { FindSectionsQueryDto } from './dto/find-sections-query.dto.ts';
import {
  SectionFindOneResponseDto,
  SectionsResponseDto,
} from './dto/sections-response.dto.ts';
import { LookupResponseDto } from '../../common/dto/lookup-response.dto.ts';

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateSectionDto,
    schoolId: string,
  ): Promise<SectionFindOneResponseDto> {
    const { name, status } = dto;

    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }
      if (!name?.trim()) {
        throw new BadRequestException('Section name is required.');
      }

      const section = await this.prisma.section.create({
        data: {
          schoolId,
          name: name.trim(),
          status,
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Section created successfully.',
        data: section,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A section with this name already exists.');
      }
      this.handlePrismaError(error);
    }
  }

  async findAll(
    query: FindSectionsQueryDto,
    schoolId: string,
  ): Promise<SectionsResponseDto> {
    const { status, searchKey, limit = 10, offset = 0 } = query;
    const where: Prisma.SectionWhereInput = {
      schoolId,
      ...(status && { status }),
      ...(searchKey && {
        name: { contains: searchKey, mode: 'insensitive' },
      }),
    };

    try {
      const [data, total] = await Promise.all([
        this.prisma.section.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
        }),
        this.prisma.section.count({ where }),
      ]);

      return {
        data,
        total,
        message: 'Sections retrieved successfully.',
        statusCode: HttpStatus.OK,
      };
    } catch {
      throw new InternalServerErrorException('Failed to retrieve sections.');
    }
  }

  async lookup(schoolId: string): Promise<LookupResponseDto> {
    const sections = await this.prisma.section.findMany({
      where: {
        schoolId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      data: sections,
      total: sections.length,
      message: 'Section options retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  async findOne(
    id: string,
    schoolId: string,
  ): Promise<SectionFindOneResponseDto> {
    try {
      const section = await this.prisma.section.findUnique({
        where: { id, schoolId },
      });

      if (!section) {
        throw new NotFoundException(`Section with ID "${id}" was not found.`);
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Section retrieved successfully.',
        data: section,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve section.');
    }
  }

  async update(
    id: string,
    schoolId: string,
    dto: UpdateSectionDto,
  ): Promise<SectionFindOneResponseDto> {
    const { name, status } = dto;

    try {
      if (name !== undefined && !name.trim()) {
        throw new BadRequestException('Section name is required.');
      }

      const current = await this.prisma.section.findUnique({
        where: { id, schoolId },
      });

      if (!current) {
        throw new NotFoundException(`Section with ID "${id}" was not found.`);
      }

      const section = await this.prisma.section.update({
        where: { id },
        data: {
          name: name?.trim(),
          status,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Section updated successfully.',
        data: section,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A section with this name already exists.');
      }
      this.handlePrismaError(error, id);
    }
  }

  async remove(id: string, schoolId: string): Promise<void> {
    try {
      const section = await this.prisma.section.findUnique({
        where: { id, schoolId },
        select: { id: true },
      });

      if (!section) {
        throw new NotFoundException(`Section with ID "${id}" was not found.`);
      }

      await this.prisma.section.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Section with ID "${id}" was not found.`);
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException('Section is linked to classes.');
      }
      this.handlePrismaError(error, id);
    }
  }

  private handlePrismaError(error: unknown, id?: string): never {
    if (error instanceof HttpException) throw error;
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException(`Section with ID "${id}" was not found.`);
    }
    throw new InternalServerErrorException('Section operation failed.');
  }
}
