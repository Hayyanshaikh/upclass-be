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
import { CreateSubjectDto } from './dto/create-subject.dto.ts';
import { UpdateSubjectDto } from './dto/update-subject.dto.ts';
import {
  SubjectFindOneResponseDto,
  SubjectsResponseDto,
} from './dto/subjects-response.dto.ts';

@Injectable()
export class SubjectsService {
  private readonly logger = new Logger(SubjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateSubjectDto,
  ): Promise<SubjectFindOneResponseDto> {
    const {
      name,
      code,
      type,
      status,
      hasPractical,
      defaultTotalMarks,
      defaultPassingMarks,
    } = dto;

    try {
      if (!name?.trim()) {
        throw new BadRequestException('Subject name is required.');
      }
      if (!code?.trim()) {
        throw new BadRequestException('Subject code is required.');
      }
      if (
        defaultPassingMarks != null &&
        defaultTotalMarks != null &&
        defaultPassingMarks > defaultTotalMarks
      ) {
        throw new BadRequestException(
          'Default passing marks cannot exceed default total marks.',
        );
      }

      const subject = await this.prisma.subject.create({
        data: {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          type,
          status,
          hasPractical: hasPractical ?? false,
          defaultTotalMarks: defaultTotalMarks ?? 100,
          defaultPassingMarks: defaultPassingMarks ?? 33,
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Subject created successfully.',
        data: subject,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Subject code already exists.');
      }
      this.handlePrismaError(error);
    }
  }

  async findAll(query: {
    searchKey?: string;
    type?: string;
    status?: string;
    limit?: number | string;
    offset?: number | string;
  }): Promise<SubjectsResponseDto> {
    try {
      const where: Prisma.SubjectWhereInput = {
        ...(query.searchKey && {
          OR: [
            { name: { contains: query.searchKey, mode: 'insensitive' as never } },
            { code: { contains: query.searchKey, mode: 'insensitive' as never } },
          ],
        }),
        ...(query.type && { type: query.type as never }),
        ...(query.status && { status: query.status as never }),
      };

      // Convert limit/offset to numbers (they may come as strings from query params)
      const limit = query.limit ? parseInt(String(query.limit), 10) : undefined;
      const offset = query.offset ? parseInt(String(query.offset), 10) : 0;

      const [subjects, total] = await Promise.all([
        this.prisma.subject.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
        }),
        this.prisma.subject.count({ where }),
      ]);

      return {
        data: subjects,
        total,
        message: 'Subjects retrieved successfully.',
        statusCode: 200,
      };
    } catch {
      throw new InternalServerErrorException('Failed to retrieve subjects.');
    }
  }

  async findOne(id: string): Promise<SubjectFindOneResponseDto> {
    try {
      const subject = await this.prisma.subject.findUnique({
        where: { id },
      });

      if (!subject) {
        throw new NotFoundException(`Subject with ID "${id}" was not found.`);
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Subject retrieved successfully.',
        data: subject,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve subject.');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.subject.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Subject with ID "${id}" was not found.`);
      }
      this.handlePrismaError(error);
    }
  }

  async update(
    id: string,
    dto: UpdateSubjectDto,
  ): Promise<SubjectFindOneResponseDto> {
    try {
      const subject = await this.prisma.subject.findUnique({ where: { id } });
      if (!subject) {
        throw new NotFoundException(`Subject with ID "${id}" was not found.`);
      }

      const updateData: Prisma.SubjectUpdateInput = {};
      if (dto.name !== undefined) updateData.name = dto.name.trim();
      if (dto.code !== undefined) updateData.code = dto.code.trim().toUpperCase();
      if (dto.type !== undefined) updateData.type = dto.type;
      if (dto.status !== undefined) updateData.status = dto.status;
      if (dto.hasPractical !== undefined) updateData.hasPractical = dto.hasPractical;
      if (dto.defaultTotalMarks !== undefined)
        updateData.defaultTotalMarks = dto.defaultTotalMarks;
      if (dto.defaultPassingMarks !== undefined)
        updateData.defaultPassingMarks = dto.defaultPassingMarks;

      const updated = await this.prisma.subject.update({
        where: { id },
        data: updateData,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Subject updated successfully.',
        data: updated,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Subject code already exists.');
      }
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof HttpException) throw error;
    throw new InternalServerErrorException('Subject operation failed.');
  }
}
