import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import {
  RoleResponseDto,
  RolesResponseDto,
} from './dto/role-response.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

export interface RoleApiResponse<T extends object | object[]> {
  data: T;
  message: string;
  statusCode: number;
}

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto): Promise<RoleResponseDto> {
    try {
      const role = await this.prisma.role.create({ data: dto });
      return this.success(role, 'Role created successfully.', 201);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(): Promise<RolesResponseDto> {
    try {
      const roles = await this.prisma.role.findMany({
        orderBy: { name: 'asc' },
      });
      return this.success(roles, 'Roles retrieved successfully.');
    } catch {
      throw new InternalServerErrorException('Failed to retrieve roles.');
    }
  }

  async findOne(id: string): Promise<RoleResponseDto> {
    try {
      const role = await this.prisma.role.findUnique({ where: { id } });
      if (!role) throw new NotFoundException(`Role with ID "${id}" was not found.`);
      return this.success(role, 'Role retrieved successfully.');
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve role.');
    }
  }

  async update(
    id: string,
    dto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    try {
      const role = await this.prisma.role.update({ where: { id }, data: dto });
      return this.success(role, 'Role updated successfully.');
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async remove(id: string): Promise<RoleResponseDto> {
    try {
      const role = await this.prisma.role.delete({ where: { id } });
      return this.success(role, 'Role deleted successfully.');
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  private success<T extends object | object[]>(
    data: T,
    message: string,
    statusCode = 200,
  ): RoleApiResponse<T> {
    return { data, message, statusCode };
  }

  private handlePrismaError(error: unknown, id?: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('A role with this name or slug already exists.');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Role with ID "${id}" was not found.`);
      }
      if (error.code === 'P2003') {
        throw new ConflictException(
          'Cannot delete this role while users are assigned to it.',
        );
      }
    }
    throw new InternalServerErrorException('Role operation failed.');
  }
}
