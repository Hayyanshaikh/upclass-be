import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.ts';
import { PrismaService } from '../../database/prisma.service.ts';
import { CreateRoleDto } from './dto/create-role.dto.ts';
import {
  RoleDetailDataDto,
  RoleResponseDto,
  RolesResponseDto,
} from './dto/role-response.dto.ts';
import { UpdateRoleDto } from './dto/update-role.dto.ts';
import { FindRolesQueryDto } from './dto/find-roles-query.dto.ts';

export interface RoleApiResponse<T extends object | object[]> {
  data: T;
  message: string;
  statusCode: number;
}

const rolePermissionsInclude = {
  permissions: { include: { permission: true } },
} as const;

type RoleWithPermissions = Prisma.RoleGetPayload<{
  include: typeof rolePermissionsInclude;
}>;

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto): Promise<RoleResponseDto> {
    try {
      const role = await this.prisma.role.create({
        data: dto,
        include: rolePermissionsInclude,
      });
      return this.success(
        this.toRoleDetail(role),
        'Role created successfully.',
        201,
      );
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(query: FindRolesQueryDto): Promise<RolesResponseDto> {
    try {
      const where: Prisma.RoleWhereInput = {
        ...(query.searchKey && {
          name: { contains: query.searchKey, mode: 'insensitive' },
        }),
        ...(query.type && { type: query.type }),
      };
      const [roles, total] = await Promise.all([
        this.prisma.role.findMany({
          where,
          take: query.limit,
          skip: query.offset ?? 0,
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
          include: { _count: { select: { users: true } } },
        }),
        this.prisma.role.count({ where }),
      ]);
      return {
        data: roles.map(({ _count, ...role }) => ({
          ...role,
          users: _count.users,
        })),
        total,
        message: 'Roles retrieved successfully.',
        statusCode: 200,
      };
    } catch {
      throw new InternalServerErrorException('Failed to retrieve roles.');
    }
  }

  async findOne(id: string): Promise<RoleResponseDto> {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id },
        include: rolePermissionsInclude,
      });
      if (!role)
        throw new NotFoundException(`Role with ID "${id}" was not found.`);
      return this.success(
        this.toRoleDetail(role),
        'Role retrieved successfully.',
      );
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve role.');
    }
  }

  async update(id: string, dto: UpdateRoleDto): Promise<RoleResponseDto> {
    try {
      const { permissionKeys, ...fields } = dto;
      let permissionIds: string[] | undefined;

      if (permissionKeys !== undefined) {
        const permissions = await this.prisma.permission.findMany({
          where: { key: { in: permissionKeys } },
          select: { id: true, key: true },
        });
        const foundKeys = new Set(permissions.map(({ key }) => key));
        const missingKeys = permissionKeys.filter((key) => !foundKeys.has(key));
        if (missingKeys.length > 0) {
          throw new BadRequestException(
            `Unknown permissions: ${missingKeys.join(', ')}.`,
          );
        }
        permissionIds = permissions.map(({ id }) => id);
      }

      const role = await this.prisma.role.update({
        where: { id },
        data: {
          ...fields,
          ...(permissionIds !== undefined && {
            permissions: {
              deleteMany: {},
              ...(permissionIds.length > 0 && {
                createMany: {
                  data: permissionIds.map((permissionId) => ({ permissionId })),
                },
              }),
            },
          }),
        },
        include: rolePermissionsInclude,
      });
      return this.success(
        this.toRoleDetail(role),
        'Role updated successfully.',
      );
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.handlePrismaError(error, id);
    }
  }

  async remove(id: string): Promise<RoleResponseDto> {
    try {
      const role = await this.prisma.role.delete({
        where: { id },
        include: rolePermissionsInclude,
      });
      return this.success(
        this.toRoleDetail(role),
        'Role deleted successfully.',
      );
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

  private toRoleDetail(role: RoleWithPermissions): RoleDetailDataDto {
    const { permissions, ...data } = role;
    return {
      ...data,
      permissionKeys: permissions
        .map(({ permission }) => permission.key)
        .sort(),
    };
  }

  private handlePrismaError(error: unknown, id?: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A role with this name or slug already exists.',
        );
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
