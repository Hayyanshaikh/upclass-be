import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.ts';
import { PrismaService } from '../../database/prisma.service.ts';
import { CreateSubjectDto } from './dto/create-subject.dto.ts';
import {
  SubjectFindOneResponseDto,
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

  private handlePrismaError(error: unknown): never {
    if (error instanceof HttpException) throw error;
    throw new InternalServerErrorException('Subject operation failed.');
  }
}
