import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.ts';
import { CreateTeacherDto } from './dto/create-teacher.dto.ts';
import { UpdateTeacherDto } from './dto/update-teacher.dto.ts';
import { FindTeachersQueryDto } from './dto/find-teachers-query.dto.ts';
import {
  TeacherFindOneResponseDto,
  TeacherResponseDto,
} from './dto/teachers-response.dto.ts';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  // Create Teacher
  async create(dto: CreateTeacherDto, userId: string) {
    try {
      const errors: string[] = [];

      if (!dto.name?.trim()) {
        errors.push('Name is required.');
      }

      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      const teacher = await this.prisma.teacher.create({
        data: {
          name: dto.name.trim(),
          userId: userId,
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Teacher created successfully.',
        data: teacher,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('CREATE TEACHER ERROR:', error);

      throw new InternalServerErrorException('Failed to create teacher.');
    }
  }

  // Get All Teachers
  async findAll(query: FindTeachersQueryDto): Promise<TeacherResponseDto> {
    const { limit = 10, offset = 0, searchKey } = query;

    const where = {
      ...(searchKey
        ? {
            name: {
              contains: searchKey,
              mode: 'insensitive' as const,
            },
          }
        : {}),
    };

    const data = await this.prisma.teacher.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: {
        id: 'desc',
      },
    });

    const total = await this.prisma.teacher.count({
      where,
    });

    return {
      data,
      total,
      message: 'Teachers retrieved successfully',
      statusCode: 200,
    };
  }

  // Get Single Teacher
  async findOne(id: string): Promise<TeacherFindOneResponseDto> {
    try {
      const errors: string[] = [];

      if (!id?.trim()) {
        errors.push('Teacher ID is required.');
      }

      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      const data = await this.prisma.teacher.findUnique({
        where: {
          id: id,
        },
      });

      if (!data) {
        throw new NotFoundException('Teacher not found.');
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Teacher retrieved successfully.',
        data,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('FIND TEACHER ERROR:', error);

      throw new InternalServerErrorException('Failed to retrieve teacher.');
    }
  }

  // Update Teacher
  async update(id: string, dto: UpdateTeacherDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return this.prisma.teacher.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name,
        }),
      },
    });
  }

  // Delete Teacher
  async remove(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return this.prisma.teacher.delete({
      where: { id },
    });
  }
}
