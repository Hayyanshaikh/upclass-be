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

  async create(
    dto: CreateTeacherDto,
    userId: string,
  ): Promise<TeacherFindOneResponseDto> {
    const {
      firstName,
      lastName,
      image,
      dateOfBirth,
      gender,
      cnicNo,
      maritalStatus,
      qualification,
      joiningDate,
      employmentType,
      isActive,
      phone,
      email,
      address,
    } = dto;

    if (!firstName?.trim()) {
      throw new BadRequestException('First name is required.');
    }
    if (lastName != null && !lastName.trim()) {
      throw new BadRequestException(
        'Last name and employee ID cannot be empty.',
      );
    }

    try {
      const employeeId = await this.generateTeacherEmployeeId();

      const teacher = await this.prisma.teacher.create({
        data: {
          userId,
          firstName: firstName.trim(),
          lastName: lastName?.trim() ?? lastName,
          employeeId: employeeId,
          image,
          dateOfBirth,
          gender,
          cnicNo,
          maritalStatus,
          qualification,
          joiningDate,
          employmentType,
          isActive,
          phone,
          email,
          address,
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Teacher created successfully.',
        data: teacher,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(query: FindTeachersQueryDto): Promise<TeacherResponseDto> {
    const { limit = 10, offset = 0, searchKey, role } = query;
    const where: Prisma.TeacherWhereInput = {
      ...(searchKey && {
        OR: [
          { firstName: { contains: searchKey, mode: 'insensitive' } },
          { lastName: { contains: searchKey, mode: 'insensitive' } },
          { employeeId: { contains: searchKey, mode: 'insensitive' } },
        ],
      }),
      ...(role && {
        user: {
          OR: [{ roleId: role }, { role: { slug: role } }],
        },
      }),
    };

    try {
      const [data, total] = await Promise.all([
        this.prisma.teacher.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        }),
        this.prisma.teacher.count({ where }),
      ]);

      return {
        data,
        total,
        message: 'Teachers retrieved successfully.',
        statusCode: HttpStatus.OK,
      };
    } catch {
      throw new InternalServerErrorException('Failed to retrieve teachers.');
    }
  }

  async findOne(id: string): Promise<TeacherFindOneResponseDto> {
    try {
      const teacher = await this.prisma.teacher.findUnique({ where: { id } });
      if (!teacher) throw new NotFoundException('Teacher not found.');

      return {
        statusCode: HttpStatus.OK,
        message: 'Teacher retrieved successfully.',
        data: teacher,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to retrieve teacher.');
    }
  }

  async update(
    id: string,
    dto: UpdateTeacherDto,
  ): Promise<TeacherFindOneResponseDto> {
    const {
      firstName,
      lastName,
      employeeId,
      image,
      dateOfBirth,
      gender,
      cnicNo,
      maritalStatus,
      qualification,
      joiningDate,
      employmentType,
      isActive,
      phone,
      email,
      address,
    } = dto;

    if (
      (firstName !== undefined && !firstName?.trim()) ||
      (lastName != null && !lastName.trim()) ||
      (employeeId != null && !employeeId.trim())
    ) {
      throw new BadRequestException(
        'First name, last name and employee ID cannot be empty.',
      );
    }

    try {
      const teacher = await this.prisma.teacher.update({
        where: { id },
        data: {
          firstName: firstName?.trim(),
          lastName: lastName?.trim() ?? lastName,
          employeeId: employeeId?.trim() ?? employeeId,
          image,
          dateOfBirth,
          gender,
          cnicNo,
          maritalStatus,
          qualification,
          joiningDate,
          employmentType,
          isActive,
          phone,
          email,
          address,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Teacher updated successfully.',
        data: teacher,
      };
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async remove(id: string): Promise<TeacherFindOneResponseDto> {
    try {
      const teacher = await this.prisma.teacher.delete({ where: { id } });
      return {
        statusCode: HttpStatus.OK,
        message: 'Teacher deleted successfully.',
        data: teacher,
      };
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  private handlePrismaError(error: unknown, id?: string): never {
    if (error instanceof HttpException) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Teacher employee ID, CNIC or email already exists.',
        );
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid user ID for teacher.');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Teacher with ID "${id}" was not found.`);
      }
    }
    throw new InternalServerErrorException('Teacher operation failed.');
  }

  async generateTeacherEmployeeId(): Promise<string> {
    const count = await this.prisma.teacher.count();

    return `T-${String(count + 1).padStart(3, '0')}`;
  }
}
