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
import { randomBytes } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { Prisma, TeacherStatus } from '../../generated/prisma/client.ts';
import { PrismaService } from '../../database/prisma.service.ts';
import { CloudinaryService } from '../cloudinary/cloudinary.service.ts';
import { CreateTeacherDto } from './dto/create-teacher.dto.ts';
import { UpdateTeacherDto } from './dto/update-teacher.dto.ts';
import { FindTeachersQueryDto } from './dto/find-teachers-query.dto.ts';
import {
  TeacherFindOneResponseDto,
  TeacherResponseDto,
} from './dto/teachers-response.dto.ts';

@Injectable()
export class TeachersService {
  private readonly logger = new Logger(TeachersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(
    dto: CreateTeacherDto,
    _userId: string,
  ): Promise<TeacherFindOneResponseDto & { temporaryPassword: string }> {
    const {
      firstName,
      lastName,
      image,
      imagePublicId,
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

    try {
      if (!firstName?.trim()) {
        throw new BadRequestException('First name is required.');
      }
      if (lastName != null && !lastName.trim()) {
        throw new BadRequestException(
          'Last name and employee ID cannot be empty.',
        );
      }
      if (!email?.trim()) {
        throw new BadRequestException(['Email is required.']);
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new BadRequestException(['Please enter a valid email address.']);
      }

      const userName = [firstName.trim(), lastName?.trim()]
        .filter(Boolean)
        .join(' ');
      const userEmail = email.trim();
      const role = await this.prisma.role.findUnique({
        where: { slug: 'teacher' },
        select: { id: true },
      });
      if (!role) {
        throw new BadRequestException('Invalid role selected.');
      }

      const temporaryPassword = randomBytes(18).toString('base64url');
      const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
      const employeeId = await this.generateTeacherEmployeeId();
      const teacher = await this.prisma.$transaction(async (tx) => {
        const existingUser = await tx.user.findUnique({
          where: { email: userEmail },
          select: { id: true },
        });
        if (existingUser) {
          throw new ConflictException('Email already exists.');
        }

        const existingName = await tx.user.findFirst({
          where: { name: { equals: userName, mode: 'insensitive' } },
          select: { id: true },
        });
        if (existingName) {
          throw new ConflictException('Username already exists.');
        }

        const user = await tx.user.create({
          data: {
            name: userName,
            email: userEmail,
            password: hashedPassword,
            roleId: role.id,
            isActive: isActive ?? true,
          },
        });

        return tx.teacher.create({
          data: {
            userId: user.id,
            firstName: firstName.trim(),
            lastName: lastName?.trim() ?? lastName,
            employeeId,
            image,
            imagePublicId,
            dateOfBirth,
            gender,
            cnicNo,
            maritalStatus,
            qualification,
            joiningDate,
            employmentType,
            isActive,
            phone,
            email: userEmail,
            address,
          },
        });
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Teacher created successfully.',
        data: teacher,
        temporaryPassword,
      };
    } catch (error) {
      await this.deleteCloudinaryImageSafely(imagePublicId);
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        Array.isArray(error.meta?.target) &&
        error.meta.target.includes('email')
      ) {
        throw new ConflictException('Email already exists.');
      }
      this.handlePrismaError(error);
    }
  }

  async findAll(query: FindTeachersQueryDto): Promise<TeacherResponseDto> {
    const { limit = 10, offset = 0, searchKey, employmentType, status, role } = query;
    const where: Prisma.TeacherWhereInput = {
      ...(searchKey && {
        OR: [
          { firstName: { contains: searchKey, mode: 'insensitive' } },
          { lastName: { contains: searchKey, mode: 'insensitive' } },
          { employeeId: { contains: searchKey, mode: 'insensitive' } },
        ],
      }),
      ...(employmentType && { employmentType }),
      ...(status && { isActive: status === TeacherStatus.ACTIVE }),
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
      imagePublicId,
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

    let currentImagePublicId: string | null | undefined;
    try {
      if (
        (firstName !== undefined && !firstName?.trim()) ||
        (lastName != null && !lastName.trim()) ||
        (employeeId != null && !employeeId.trim())
      ) {
        throw new BadRequestException(
          'First name, last name and employee ID cannot be empty.',
        );
      }
      if (email !== undefined && !email?.trim()) {
        throw new BadRequestException('Email is required.');
      }

      const teacher = await this.prisma.$transaction(async (tx) => {
        const current = await tx.teacher.findUnique({
          where: { id },
          select: {
            firstName: true,
            lastName: true,
            image: true,
            imagePublicId: true,
            userId: true,
            user: { select: { name: true, email: true } },
          },
        });
        if (!current) throw new NotFoundException('Teacher not found.');
        currentImagePublicId =
          current.imagePublicId ?? this.extractPublicIdFromImageUrl(current.image);

        const nextFirstName = firstName?.trim() ?? current.firstName;
        const nextLastName =
          lastName === undefined
            ? current.lastName
            : lastName?.trim() ?? lastName;
        const nextName = [nextFirstName, nextLastName].filter(Boolean).join(' ');
        const nextEmail = email?.trim() ?? current.user.email;

        if (nextEmail !== current.user.email) {
          const existingEmail = await tx.user.findFirst({
            where: { email: nextEmail, id: { not: current.userId } },
            select: { id: true },
          });
          if (existingEmail) {
            throw new ConflictException('Email already exists.');
          }
        }
        if (nextName !== current.user.name) {
          const existingName = await tx.user.findFirst({
            where: {
              name: { equals: nextName, mode: 'insensitive' },
              id: { not: current.userId },
            },
            select: { id: true },
          });
          if (existingName) {
            throw new ConflictException('Username already exists.');
          }
        }

        await tx.user.update({
          where: { id: current.userId },
          data: {
            name: nextName,
            email: nextEmail,
            isActive: isActive ?? undefined,
          },
        });

        return tx.teacher.update({
          where: { id },
          data: {
            firstName: firstName?.trim(),
            lastName: lastName?.trim() ?? lastName,
            employeeId: employeeId?.trim() ?? employeeId,
            image,
            imagePublicId,
            dateOfBirth,
            gender,
            cnicNo,
            maritalStatus,
            qualification,
            joiningDate,
            employmentType,
            isActive,
            phone,
            email: email?.trim() ?? email,
            address,
          },
        });
      });

      if (
        imagePublicId !== undefined &&
        currentImagePublicId &&
        currentImagePublicId !== imagePublicId
      ) {
        await this.deleteCloudinaryImageSafely(currentImagePublicId);
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Teacher updated successfully.',
        data: teacher,
      };
    } catch (error) {
      if (imagePublicId && imagePublicId !== currentImagePublicId) {
        await this.deleteCloudinaryImageSafely(imagePublicId);
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        Array.isArray(error.meta?.target) &&
        error.meta.target.includes('email')
      ) {
        throw new ConflictException('Email already exists.');
      }
      this.handlePrismaError(error, id);
    }
  }

  async remove(id: string): Promise<TeacherFindOneResponseDto> {
    try {
      const teacher = await this.prisma.$transaction(async (tx) => {
        const record = await tx.teacher.findUnique({ where: { id } });
        if (!record) throw new NotFoundException('Teacher not found.');

        const user = await tx.user.findUnique({
          where: { id: record.userId },
          select: { isSystem: true },
        });
        if (!user || user.isSystem) {
          throw new ConflictException('The linked user cannot be deleted.');
        }

        const otherTeachers = await tx.teacher.count({
          where: { userId: record.userId, id: { not: id } },
        });
        if (otherTeachers > 0) {
          throw new ConflictException(
            'The linked user is connected to another teacher. Neither record was deleted.',
          );
        }

        const deletedTeacher = await tx.teacher.delete({ where: { id } });
        const deletedUser = await tx.user.deleteMany({
          where: { id: record.userId, isSystem: false },
        });
        if (deletedUser.count !== 1) {
          throw new ConflictException('The linked user could not be deleted.');
        }

        return deletedTeacher;
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'Teacher and linked user deleted successfully.',
        data: teacher,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2003' || error.code === 'P2014')
      ) {
        throw new ConflictException(
          'The linked user is connected to another record. Neither record was deleted.',
        );
      }
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

  private async deleteCloudinaryImageSafely(
    publicId: string | null | undefined,
  ): Promise<void> {
    if (!publicId) return;

    try {
      await this.cloudinary.deleteImage(publicId);
    } catch (error) {
      this.logger.error(
        `Failed to delete Cloudinary image "${publicId}".`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private extractPublicIdFromImageUrl(imageUrl: string | null): string | null {
    if (!imageUrl) return null;

    try {
      const url = new URL(imageUrl);
      if (url.hostname !== 'res.cloudinary.com') return null;

      const uploadPath = '/image/upload/';
      const uploadPathIndex = url.pathname.indexOf(uploadPath);
      if (uploadPathIndex === -1) return null;

      const assetPath = url.pathname.slice(uploadPathIndex + uploadPath.length);
      const versionMatch = assetPath.match(/(?:^|\/)v\d+\//);
      const publicIdPath =
        versionMatch?.index !== undefined
          ? assetPath.slice(versionMatch.index + versionMatch[0].length)
          : assetPath;
      const publicId = decodeURIComponent(publicIdPath).replace(
        /\.[^/.]+$/,
        '',
      );

      return publicId || null;
    } catch {
      return null;
    }
  }

  async generateTeacherEmployeeId(): Promise<string> {
    const count = await this.prisma.teacher.count();

    return `T-${String(count + 1).padStart(3, '0')}`;
  }
}
