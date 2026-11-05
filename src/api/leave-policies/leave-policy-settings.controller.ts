import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
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

import { LeavePolicySettingsService } from './leave-policy-settings.service.ts';
import { CreateLeavePolicySettingsDto } from './dto/create-leave-policy-settings.dto.ts';
import { UpdateLeavePolicySettingsDto } from './dto/update-leave-policy-settings.dto.ts';
import { LeavePolicySettingResponseDto } from './dto/leave-policy-settings-response.dto.ts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.ts';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.ts';
import { Permissions } from '../auth/decorators/permissions.decorator.ts';
import { LEAVE_POLICY_SETTING_PERMISSIONS } from './entities/leave-policy-setting.permission.ts';

@ApiTags('Leave Policy Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('leave-policy-settings')
export class LeavePolicySettingsController {
  constructor(
    private readonly leavePolicySettingsService: LeavePolicySettingsService,
  ) {}

  @Permissions(LEAVE_POLICY_SETTING_PERMISSIONS.VIEW)
  @Get()
  @ApiOperation({ summary: 'Get leave policy settings for the school' })
  @ApiOkResponse({
    description: 'Leave policy settings retrieved successfully',
    type: LeavePolicySettingResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Leave policy settings are not configured',
  })
  findOne(
    @Req() req: AuthenticatedRequest,
  ): Promise<LeavePolicySettingResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.leavePolicySettingsService.findOne(schoolId);
  }

  @Permissions(LEAVE_POLICY_SETTING_PERMISSIONS.EDIT)
  @Post()
  @ApiOperation({ summary: 'Create leave policy settings if they do not exist' })
  @ApiCreatedResponse({
    description: 'Leave policy settings created successfully',
    type: LeavePolicySettingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Leave policy settings already exist for this school',
  })
  create(
    @Body() createLeavePolicySettingsDto: CreateLeavePolicySettingsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<LeavePolicySettingResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.leavePolicySettingsService.create(
      createLeavePolicySettingsDto,
      schoolId,
    );
  }

  @Permissions(LEAVE_POLICY_SETTING_PERMISSIONS.EDIT)
  @Patch()
  @ApiOperation({ summary: 'Update leave policy settings' })
  @ApiOkResponse({
    description: 'Leave policy settings updated successfully',
    type: LeavePolicySettingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({
    status: 404,
    description: 'Leave policy settings are not configured',
  })
  update(
    @Body() updateLeavePolicySettingsDto: UpdateLeavePolicySettingsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<LeavePolicySettingResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.leavePolicySettingsService.update(
      updateLeavePolicySettingsDto,
      schoolId,
    );
  }
}
