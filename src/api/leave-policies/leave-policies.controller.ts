import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { LeavePoliciesService } from './leave-policies.service.ts';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto.ts';
import { UpdateLeavePolicyDto } from './dto/update-leave-policy.dto.ts';
import {
  LeavePoliciesResponseDto,
  LeavePolicyFindOneResponseDto,
} from './dto/leave-policies-response.dto.ts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.ts';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.ts';
import { Permissions } from '../auth/decorators/permissions.decorator.ts';
import { LEAVE_POLICY_PERMISSIONS } from './entities/leave-policy.permission.ts';

@ApiTags('Leave Policies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('leave-policies')
export class LeavePoliciesController {
  constructor(private readonly leavePoliciesService: LeavePoliciesService) {}

  @Permissions(LEAVE_POLICY_PERMISSIONS.CREATE)
  @Post()
  @ApiOperation({ summary: 'Create a leave policy' })
  @ApiCreatedResponse({
    description: 'Leave policy created successfully',
    type: LeavePolicyFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Leave policy already exists' })
  create(
    @Body() createLeavePolicyDto: CreateLeavePolicyDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<LeavePolicyFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.leavePoliciesService.create(createLeavePolicyDto, schoolId);
  }

  @Permissions(LEAVE_POLICY_PERMISSIONS.VIEW)
  @Get()
  @ApiOperation({ summary: 'List leave policies for the school' })
  @ApiOkResponse({
    description: 'Leave policies retrieved successfully',
    type: LeavePoliciesResponseDto,
  })
  findAll(@Req() req: AuthenticatedRequest): Promise<LeavePoliciesResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.leavePoliciesService.findAll(schoolId);
  }

  @Permissions(LEAVE_POLICY_PERMISSIONS.VIEW)
  @Get(':id')
  @ApiOperation({ summary: 'Get a leave policy by ID' })
  @ApiOkResponse({
    description: 'Leave policy retrieved successfully',
    type: LeavePolicyFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Leave policy not found' })
  findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<LeavePolicyFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.leavePoliciesService.findOne(id, schoolId);
  }

  @Permissions(LEAVE_POLICY_PERMISSIONS.EDIT)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a leave policy' })
  @ApiOkResponse({
    description: 'Leave policy updated successfully',
    type: LeavePolicyFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Leave policy not found' })
  @ApiResponse({ status: 409, description: 'Leave policy already exists' })
  update(
    @Param('id') id: string,
    @Body() updateLeavePolicyDto: UpdateLeavePolicyDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<LeavePolicyFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.leavePoliciesService.update(id, schoolId, updateLeavePolicyDto);
  }

  @Permissions(LEAVE_POLICY_PERMISSIONS.DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a leave policy' })
  @ApiNoContentResponse({ description: 'Leave policy deleted successfully' })
  @ApiResponse({ status: 404, description: 'Leave policy not found' })
  remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    const schoolId = req.headers['schoolid'] as string;
    return this.leavePoliciesService.remove(id, schoolId);
  }
}
