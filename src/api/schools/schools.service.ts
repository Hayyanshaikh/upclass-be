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
import { SchoolDefaultsService } from './school-defaults.service.ts';
import { CloudinaryService } from '../cloudinary/cloudinary.service.ts';

@Injectable()
export class SchoolsService {
  private readonly logger = new Logger(SchoolsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly schoolDefaultsService: SchoolDefaultsService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(dto: CreateSchoolDto): Promise<SchoolFindOneResponseDto> {
    const {
      name,
      email,
      phone,
      address,
      isActive,
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

      const result = await this.prisma.$transaction(async (tx) => {
        const school = await tx.school.create({
          data: {
            name: name.trim(),
            email: email?.trim() ?? null,
            phone: phone?.trim() ?? null,
            address: address?.trim() ?? null,
            isActive: isActive ?? true,
          },
        });

        await this.schoolDefaultsService.createDefaults(tx, school.id);

        // School Admin role retrieve karein
        const adminRole = await tx.role.findFirstOrThrow({
          where: {
            schoolId: school.id,
            slug: 'school_admin',
          },
        });

        await tx.user.create({
          data: {
            name: adminName.trim(),
            email: adminEmail.trim(),
            password: hashedPassword,
            roleId: adminRole.id,
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
    const {
      name,
      email,
      phone,
      address,
      isActive,

      // School Profile
      logo,
      shortCode,
      schoolType,
      educationSystem,
      establishedYear,
      description,

      // Administration Details
      principalName,
      vicePrincipalName,
      adminContact,
      ownerName,

      // School Settings
      dateFormat,
      feeDueDate,
      workingDays,

      // School Timings
      openingTime,
      closingTime,
    } = dto;

    try {
      const school = await this.prisma.school.findUnique({
        where: { id },
      });

      if (!school) {
        throw new NotFoundException(`School with ID "${id}" was not found.`);
      }

      // Get existing Cloudinary logo public ID
      const currentLogoPublicId = this.cloudinary.extractPublicIdFromImageUrl(
        school.logo,
      );

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

      // Existing Fields
      if (name !== undefined) updateData.name = name.trim();
      if (email !== undefined) updateData.email = email.trim();
      if (phone !== undefined) updateData.phone = phone?.trim() ?? null;
      if (address !== undefined) updateData.address = address?.trim() ?? null;

      if (isActive !== undefined && isActive !== null) {
        updateData.isActive = isActive;
      }

      // School Profile
      if (logo !== undefined) updateData.logo = logo;
      if (shortCode !== undefined) updateData.shortCode = shortCode;
      if (schoolType !== undefined) updateData.schoolType = schoolType;

      if (educationSystem !== undefined) {
        updateData.educationSystem = educationSystem;
      }

      if (establishedYear !== undefined) {
        updateData.establishedYear = establishedYear;
      }

      if (description !== undefined) {
        updateData.description = description;
      }

      // Administration Details
      if (principalName !== undefined) {
        updateData.principalName = principalName;
      }

      if (vicePrincipalName !== undefined) {
        updateData.vicePrincipalName = vicePrincipalName;
      }

      if (adminContact !== undefined) {
        updateData.adminContact = adminContact;
      }

      if (ownerName !== undefined) {
        updateData.ownerName = ownerName;
      }

      // School Settings
      if (dateFormat !== undefined) {
        updateData.dateFormat = dateFormat;
      }

      if (feeDueDate !== undefined) {
        updateData.feeDueDate = feeDueDate;
      }

      if (workingDays !== undefined) {
        updateData.workingDays = workingDays;
      }

      // School Timings
      if (openingTime !== undefined) {
        updateData.openingTime = openingTime;
      }

      if (closingTime !== undefined) {
        updateData.closingTime = closingTime;
      }

      // Update School
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

      // Delete old Cloudinary logo after successful database update
      if (logo !== undefined && currentLogoPublicId) {
        const newLogoPublicId =
          this.cloudinary.extractPublicIdFromImageUrl(logo);

        if (currentLogoPublicId !== newLogoPublicId) {
          await this.cloudinary.deleteImageSafely(currentLogoPublicId);
        }
      }

      console.log('Old Logo URL:', school.logo);
      console.log('Old Public ID:', currentLogoPublicId);
      console.log('New Logo URL:', logo);
      console.log(
        'New Public ID:',
        this.cloudinary.extractPublicIdFromImageUrl(logo),
      );

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
