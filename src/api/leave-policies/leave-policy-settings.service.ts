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
import { CreateLeavePolicySettingsDto } from './dto/create-leave-policy-settings.dto.ts';
import { UpdateLeavePolicySettingsDto } from './dto/update-leave-policy-settings.dto.ts';
import { LeavePolicySettingResponseDto } from './dto/leave-policy-settings-response.dto.ts';

@Injectable()
export class LeavePolicySettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(schoolId: string): Promise<LeavePolicySettingResponseDto> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const settings = await this.prisma.leavePolicySetting.findUnique({
        where: { schoolId },
      });

      if (!settings) {
        throw new NotFoundException(
          'Leave policy settings are not configured for this school.',
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Leave policy settings retrieved successfully.',
        data: settings,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to retrieve leave policy settings.',
      );
    }
  }

  async create(
    dto: CreateLeavePolicySettingsDto,
    schoolId: string,
  ): Promise<LeavePolicySettingResponseDto> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const existingSettings = await this.prisma.leavePolicySetting.findUnique({
        where: { schoolId },
        select: { id: true },
      });

      if (existingSettings) {
        throw new ConflictException(
          'Leave policy settings already exist for this school.',
        );
      }

      const settings = await this.prisma.leavePolicySetting.create({
        data: {
          schoolId,
          approvalRequired: dto.approvalRequired ?? true,
          carryForward: dto.carryForward ?? false,
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Leave policy settings created successfully.',
        data: settings,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Leave policy settings already exist for this school.',
        );
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Invalid school context for leave policy settings.',
        );
      }
      this.handlePrismaError(error);
    }
  }

  async update(
    dto: UpdateLeavePolicySettingsDto,
    schoolId: string,
  ): Promise<LeavePolicySettingResponseDto> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const existingSettings = await this.prisma.leavePolicySetting.findUnique({
        where: { schoolId },
        select: { id: true },
      });

      if (!existingSettings) {
        throw new NotFoundException(
          'Leave policy settings are not configured for this school.',
        );
      }

      const settings = await this.prisma.leavePolicySetting.update({
        where: { schoolId },
        data: {
          approvalRequired: dto.approvalRequired,
          carryForward: dto.carryForward,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Leave policy settings updated successfully.',
        data: settings,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          'Leave policy settings are not configured for this school.',
        );
      }
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof HttpException) throw error;
    throw new InternalServerErrorException(
      'Leave policy settings operation failed.',
    );
  }
}
