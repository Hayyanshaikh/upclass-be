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
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto.ts';
import { UpdateLeavePolicyDto } from './dto/update-leave-policy.dto.ts';
import {
  LeavePoliciesResponseDto,
  LeavePolicyFindOneResponseDto,
} from './dto/leave-policies-response.dto.ts';

@Injectable()
export class LeavePoliciesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateLeavePolicyDto,
    schoolId: string,
  ): Promise<LeavePolicyFindOneResponseDto> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const name = dto.name?.trim();
      if (!name) {
        throw new BadRequestException('Leave type name is required.');
      }

      const existingPolicy = await this.prisma.leavePolicy.findFirst({
        where: { schoolId, name },
        select: { id: true },
      });

      if (existingPolicy) {
        throw new ConflictException('Leave policy already exists.');
      }

      const leavePolicy = await this.prisma.leavePolicy.create({
        data: {
          schoolId,
          name,
          daysPerYear: dto.daysPerYear,
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Leave policy created successfully.',
        data: leavePolicy,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Leave policy already exists.');
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Invalid school context for leave policy.',
        );
      }
      this.handlePrismaError(error);
    }
  }

  async findAll(schoolId: string): Promise<LeavePoliciesResponseDto> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const where: Prisma.LeavePolicyWhereInput = { schoolId };

      const [leavePolicies, total] = await Promise.all([
        this.prisma.leavePolicy.findMany({
          where,
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
        }),
        this.prisma.leavePolicy.count({ where }),
      ]);

      return {
        data: leavePolicies,
        total,
        message: 'Leave policies retrieved successfully.',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to retrieve leave policies.',
      );
    }
  }

  async findOne(
    id: string,
    schoolId: string,
  ): Promise<LeavePolicyFindOneResponseDto> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const leavePolicy = await this.prisma.leavePolicy.findFirst({
        where: { id, schoolId },
      });

      if (!leavePolicy) {
        throw new NotFoundException(
          `Leave policy with ID "${id}" was not found.`,
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Leave policy retrieved successfully.',
        data: leavePolicy,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to retrieve leave policy.',
      );
    }
  }

  async update(
    id: string,
    schoolId: string,
    dto: UpdateLeavePolicyDto,
  ): Promise<LeavePolicyFindOneResponseDto> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const existingPolicy = await this.prisma.leavePolicy.findFirst({
        where: { id, schoolId },
      });

      if (!existingPolicy) {
        throw new NotFoundException(
          `Leave policy with ID "${id}" was not found.`,
        );
      }

      const nextName =
        dto.name !== undefined ? dto.name.trim() : existingPolicy.name;

      if (!nextName) {
        throw new BadRequestException('Leave type name is required.');
      }

      if (nextName !== existingPolicy.name) {
        const duplicatePolicy = await this.prisma.leavePolicy.findFirst({
          where: { schoolId, name: nextName, NOT: { id } },
          select: { id: true },
        });

        if (duplicatePolicy) {
          throw new ConflictException('Leave policy already exists.');
        }
      }

      const leavePolicy = await this.prisma.leavePolicy.update({
        where: { id },
        data: {
          name: nextName,
          daysPerYear: dto.daysPerYear ?? existingPolicy.daysPerYear,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Leave policy updated successfully.',
        data: leavePolicy,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Leave policy already exists.');
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Leave policy with ID "${id}" was not found.`,
        );
      }
      this.handlePrismaError(error);
    }
  }

  async remove(id: string, schoolId: string): Promise<void> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const leavePolicy = await this.prisma.leavePolicy.findFirst({
        where: { id, schoolId },
        select: { id: true },
      });

      if (!leavePolicy) {
        throw new NotFoundException(
          `Leave policy with ID "${id}" was not found.`,
        );
      }

      await this.prisma.leavePolicy.delete({ where: { id } });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Leave policy with ID "${id}" was not found.`,
        );
      }
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof HttpException) throw error;
    throw new InternalServerErrorException('Leave policy operation failed.');
  }
}
