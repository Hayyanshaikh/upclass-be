import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.ts';
import {
  PermissionResponseDto,
  PermissionsResponseDto,
} from './dto/permission-response.dto.ts';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PermissionsResponseDto> {
    try {
      const permissions = await this.prisma.permission.findMany({
        orderBy: [{ sortOrder: 'asc' }, { key: 'asc' }],
      });
      return {
        data: permissions,
        total: permissions.length,
        message: 'Permissions retrieved successfully.',
        statusCode: 200,
      };
    } catch {
      throw new InternalServerErrorException('Failed to retrieve permissions.');
    }
  }

  async findOne(key: string): Promise<PermissionResponseDto> {
    try {
      const permission = await this.prisma.permission.findUnique({
        where: { key },
      });
      if (!permission) {
        throw new NotFoundException(`Permission "${key}" was not found.`);
      }
      return {
        data: permission,
        message: 'Permission retrieved successfully.',
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve permission.');
    }
  }
}
