import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client.ts';
import { PrismaService } from '../../database/prisma.service.ts';
import { CreateUserDto } from './dto/create-user.dto.ts';
import { UpdateUserDto } from './dto/update-user.dto.ts';
import { FindUsersQueryDto } from './dto/find-users-query.dto.ts';
import * as bcrypt from 'bcrypt';
import {
  LoginResponseUserDto,
  UserFindOneResponseDto,
  UserResponseDto,
} from './dto/user-response.dto.ts';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE USER

  async create(dto: CreateUserDto) {
    try {
      const errors: string[] = [];

      if (!dto.name?.trim()) {
        errors.push('Name is required.');
      }

      if (!dto.email?.trim()) {
        errors.push('Email is required.');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) {
        errors.push('Please enter a valid email address.');
      }

      if (!dto.password?.trim()) {
        errors.push('Password is required.');
      } else if (dto.password.length < 8) {
        errors.push('Password must be at least 8 characters.');
      }

      if (!dto.roleId?.trim()) {
        errors.push('Role is required.');
      }

      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email.trim() },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists.');
      }

      const role = await this.prisma.role.findUnique({
        where: { id: dto.roleId },
      });

      if (!role) {
        throw new BadRequestException('Invalid role selected.');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 12);

      const user = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name: dto.name.trim(),
            email: dto.email.trim(),
            password: hashedPassword,
            roleId: dto.roleId,
            isActive: dto.isActive,
          },
          omit: {
            password: true,
          },
        });

        if (role.slug === 'teacher') {
          await tx.teacher.create({
            data: {
              name: dto.name.trim(),
              userId: newUser.id,
            },
          });
        }

        return newUser;
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'User created successfully.',
        data: user,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already exists.');
      }

      console.error('CREATE USER ERROR:', error);

      throw new InternalServerErrorException('Failed to create user.');
    }
  }

  async findAll(query: FindUsersQueryDto): Promise<UserResponseDto> {
    try {
      const where: Prisma.UserWhereInput = {
        ...(query.role && {
          OR: [{ roleId: query.role }, { role: { slug: query.role } }],
        }),
        ...(query.searchKey && {
          name: {
            contains: query.searchKey,
            mode: 'insensitive',
          },
        }),
      };
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          take: query.limit,
          skip: query.offset ?? 0,
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true,
            role: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            isActive: true,
            isSystem: true,
          },
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        data: users,
        total,
        message: 'Users retrieved successfully',
        statusCode: 200,
      };
    } catch (error) {
      console.error('GET USERS ERROR:', error);

      throw new InternalServerErrorException({
        message: 'Failed to retrieve users.',
        errors: ['An unexpected error occurred.'],
      });
    }
  }

  // GET USER BY ID
  async findOne(id: string): Promise<UserFindOneResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          roleId: true,
          role: {
            select: {
              id: true,
              name: true,
              slug: true,
              permissions: {
                select: {
                  permission: {
                    select: {
                      key: true,
                    },
                  },
                },
              },
            },
          },
          isActive: true,
          isSystem: true,
        },
      });

      if (!user) {
        throw new NotFoundException({
          message: 'User not found.',
          errors: [`User with ID ${id} was not found.`],
        });
      }

      const returnUser: LoginResponseUserDto = {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        isActive: user.isActive,
        isSystem: user.isSystem,
        role: user.role
          ? {
              id: user.role.id,
              name: user.role.name,
              slug: user.role.slug,
              permissions: user.role.permissions.map(({ permission }) => ({
                key: permission.key,
              })),
            }
          : undefined,
      };

      return {
        statusCode: HttpStatus.OK,
        message: 'User retrieved successfully.',
        data: returnUser,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('GET USER ERROR:', error);

      throw new InternalServerErrorException({
        message: 'Failed to retrieve user.',
        errors: ['An unexpected error occurred.'],
      });
    }
  }

  // UPDATE USER
  async update(id: string, dto: UpdateUserDto) {
    try {
      const errors: string[] = [];

      if (dto.name !== undefined && !dto.name.trim()) {
        errors.push('Name cannot be empty.');
      }

      if (dto.email !== undefined) {
        if (!dto.email.trim()) {
          errors.push('Email cannot be empty.');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) {
          errors.push('Please enter a valid email address.');
        }
      }

      if (dto.password !== undefined) {
        if (!dto.password.trim()) {
          errors.push('Password cannot be empty.');
        } else if (dto.password.length < 8) {
          errors.push('Password must be at least 8 characters.');
        }
      }

      if (errors.length > 0) {
        throw new BadRequestException({
          message: 'Validation failed.',
          errors,
        });
      }

      const { password, ...changes } = dto;
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...changes,
          ...(password !== undefined
            ? { password: await bcrypt.hash(password, 12) }
            : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          roleId: true,
          role: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          isActive: true,
          isSystem: true,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'User updated successfully.',
        data: user,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException({
            message: 'User not found.',
            errors: [`User with ID ${id} was not found.`],
          });
        }

        if (error.code === 'P2002') {
          throw new ConflictException({
            message: 'User already exists.',
            errors: ['Email already exists.'],
          });
        }
      }

      console.error('UPDATE USER ERROR:', error);

      throw new InternalServerErrorException({
        message: 'Failed to update user.',
        errors: ['An unexpected error occurred.'],
      });
    }
  }

  // DELETE USER
  async remove(id: string) {
    try {
      const result = await this.prisma.user.deleteMany({
        where: { id, isSystem: false },
      });

      if (result.count === 0) {
        const user = await this.prisma.user.findUnique({
          where: { id },
          select: { isSystem: true },
        });

        if (user?.isSystem) {
          throw new ForbiddenException('System users cannot be deleted.');
        }

        throw new NotFoundException('User not found.');
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'User deleted successfully.',
        data: { id },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('DELETE USER ERROR:', error);

      throw new InternalServerErrorException({
        message: 'Failed to delete user.',
        errors: ['An unexpected error occurred.'],
      });
    }
  }
}
