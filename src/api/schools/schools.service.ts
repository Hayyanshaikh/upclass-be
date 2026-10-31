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
import { CreateSchoolDto } from './dto/create-school.dto.ts';
import { UpdateSchoolDto } from './dto/update-school.dto.ts';
import { FindSchoolsQueryDto } from './dto/find-schools-query.dto.ts';
import {
  SchoolFindOneResponseDto,
  SchoolsResponseDto,
} from './dto/schools-response.dto.ts';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SchoolsService {
  private readonly logger = new Logger(SchoolsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSchoolDto): Promise<SchoolFindOneResponseDto> {
    const {
      name,
      email,
      phone,
      address,
      adminName,
      adminEmail,
      adminPassword,
    } = dto;

    try {
      if (!name?.trim()) {
        throw new BadRequestException('School name is required.');
      }

      if (!adminName?.trim() || !adminEmail?.trim() || !adminPassword) {
        throw new BadRequestException('School admin details are required.');
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new BadRequestException('Please enter a valid school email.');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
        throw new BadRequestException('Please enter a valid admin email.');
      }

      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      const schoolAdminRole = await this.prisma.role.findUnique({
        where: { slug: 'school_admin' },
      });

      if (!schoolAdminRole) {
        throw new NotFoundException('School Admin role not found.');
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const school = await tx.school.create({
          data: {
            name: name.trim(),
            email: email?.trim() ?? null,
            phone: phone?.trim() ?? null,
            address: address?.trim() ?? null,
            isActive: true,
          },
        });

        await tx.user.create({
          data: {
            name: adminName.trim(),
            email: adminEmail.trim(),
            password: hashedPassword,
            roleId: schoolAdminRole.id,
            schoolId: school.id,
            isActive: true,
            isSystem: false,
          },
        });

        return school;
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'School and School Admin created successfully.',
        data: result,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already exists.');
      }

      this.handlePrismaError(error);
    }
  }

  async findAll(query: FindSchoolsQueryDto): Promise<SchoolsResponseDto> {
    const { limit = 10, offset = 0, searchKey, status } = query;

    const where: Prisma.SchoolWhereInput = {
      ...(searchKey && {
        OR: [
          { name: { contains: searchKey, mode: 'insensitive' } },
          { email: { contains: searchKey, mode: 'insensitive' } },
          { address: { contains: searchKey, mode: 'insensitive' } },
        ],
      }),
      ...(status && { isActive: status === 'active' }),
    };

    try {
      const [data, total] = await Promise.all([
        this.prisma.school.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          include: {
            _count: {
              select: {
                users: true,
              },
            },
          },
        }),
        this.prisma.school.count({ where }),
      ]);

      return {
        data: data.map((school) => ({
          ...school,
          usersCount: school._count.users,
        })),
        total,
        message: 'Schools retrieved successfully.',
        statusCode: HttpStatus.OK,
      };
    } catch {
      throw new InternalServerErrorException('Failed to retrieve schools.');
    }
  }

  async findOne(id: string): Promise<SchoolFindOneResponseDto> {
    try {
      const school = await this.prisma.school.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
      });

      if (!school) {
        throw new NotFoundException(`School with ID "${id}" was not found.`);
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'School retrieved successfully.',
        data: {
          ...school,
          usersCount: school._count.users,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to retrieve school.');
    }
  }

  async update(
    id: string,
    dto: UpdateSchoolDto,
  ): Promise<SchoolFindOneResponseDto> {
    const { name, email, phone, address } = dto;

    try {
      const school = await this.prisma.school.findUnique({
        where: { id },
      });

      if (!school) {
        throw new NotFoundException(`School with ID "${id}" was not found.`);
      }

      if (name !== undefined && !name?.trim()) {
        throw new BadRequestException('School name cannot be empty.');
      }

      if (email !== undefined && !email?.trim()) {
        throw new BadRequestException('Email is required.');
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new BadRequestException('Please enter a valid email address.');
      }

      const updateData: Prisma.SchoolUpdateInput = {};
      if (name !== undefined) updateData.name = name.trim();
      if (email !== undefined) updateData.email = email.trim() ?? null;
      if (phone !== undefined) updateData.phone = phone?.trim() ?? null;
      if (address !== undefined) updateData.address = address?.trim() ?? null;

      const updated = await this.prisma.school.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'School updated successfully.',
        data: {
          ...updated,
          usersCount: updated._count.users,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('School with this email already exists.');
      }
      this.handlePrismaError(error, id);
    }
  }

  async remove(id: string): Promise<SchoolFindOneResponseDto> {
    try {
      const school = await this.prisma.school.findUnique({
        where: { id },
        include: {
          users: { select: { id: true } },
        },
      });

      if (!school) {
        throw new NotFoundException(`School with ID "${id}" was not found.`);
      }

      // Check if school has associated users
      if (school.users.length > 0) {
        throw new ConflictException(
          'School has associated users. Please remove or reassign users before deleting the school.',
        );
      }

      await this.prisma.school.delete({
        where: { id },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'School deleted successfully.',
        data: school,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2003' || error.code === 'P2014')
      ) {
        throw new ConflictException(
          'School is connected to other records. Cannot delete.',
        );
      }
      this.handlePrismaError(error, id);
    }
  }

  private handlePrismaError(error: unknown, id?: string): never {
    if (error instanceof HttpException) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('School with this email already exists.');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`School with ID "${id}" was not found.`);
      }
    }
    throw new InternalServerErrorException('School operation failed.');
  }
}
