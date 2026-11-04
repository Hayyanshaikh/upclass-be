import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesService } from './roles.service.ts';
import { CreateRoleDto } from './dto/create-role.dto.ts';
import { RoleResponseDto, RolesResponseDto } from './dto/role-response.dto.ts';
import { UpdateRoleDto } from './dto/update-role.dto.ts';
import { FindRolesQueryDto } from './dto/find-roles-query.dto.ts';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.ts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.ts';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import { ROLE_PERMISSIONS } from './entities/role.permission.ts';
import { Permissions } from '../auth/decorators/permissions.decorator.ts';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions(ROLE_PERMISSIONS.CREATE)
  @ApiOperation({ summary: 'Create a role' })
  @ApiCreatedResponse({
    description: 'Role created successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Role name or slug already exists' })
  create(
    @Body() dto: CreateRoleDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<RoleResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.rolesService.create(dto, schoolId);
  }

  @Get()
  @Permissions(ROLE_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Get all roles' })
  @ApiOkResponse({
    description: 'Roles retrieved successfully',
    type: RolesResponseDto,
  })
  findAll(
    @Query() query: FindRolesQueryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<RolesResponseDto> {
    const schoolId = req.headers['schoolid'] as string;

    return this.rolesService.findAll(query, schoolId);
  }

  @Get(':id')
  @Permissions(ROLE_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiOkResponse({
    description: 'Role retrieved successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  findOne(@Param('id') id: string): Promise<RoleResponseDto> {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @Permissions(ROLE_PERMISSIONS.EDIT)
  @ApiOperation({ summary: 'Update a role' })
  @ApiOkResponse({
    description: 'Role updated successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 409, description: 'Role name or slug already exists' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<RoleResponseDto> {
    return this.rolesService.update(id, dto, req);
  }

  @Delete(':id')
  @Permissions(ROLE_PERMISSIONS.DELETE)
  @ApiOperation({ summary: 'Delete a role' })
  @ApiOkResponse({
    description: 'Role deleted successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 409, description: 'Role is assigned to users' })
  remove(@Param('id') id: string): Promise<RoleResponseDto> {
    return this.rolesService.remove(id);
  }
}
