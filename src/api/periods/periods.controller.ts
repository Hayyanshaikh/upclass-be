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
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PeriodsService } from './periods.service.ts';
import { CreatePeriodDto } from './dto/create-period.dto.ts';
import { UpdatePeriodDto } from './dto/update-period.dto.ts';
import {
  PeriodFindOneResponseDto,
  PeriodsResponseDto,
} from './dto/periods-response.dto.ts';
import { FindPeriodsQueryDto } from './dto/find-periods-query.dto.ts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.ts';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.ts';
import { Permissions } from '../auth/decorators/permissions.decorator.ts';
import { PERIOD_PERMISSIONS } from './entities/period.permission.ts';

@ApiTags('Periods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('periods')
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Permissions(PERIOD_PERMISSIONS.CREATE)
  @Post()
  @ApiOperation({ summary: 'Create a period' })
  @ApiCreatedResponse({
    description: 'Period created successfully',
    type: PeriodFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Period name or time slot conflict' })
  create(
    @Body() createPeriodDto: CreatePeriodDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PeriodFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.periodsService.create(createPeriodDto, schoolId);
  }

  @Permissions(PERIOD_PERMISSIONS.VIEW)
  @Get()
  @ApiOperation({ summary: 'List all periods' })
  @ApiOkResponse({
    description: 'Periods retrieved successfully',
    type: PeriodsResponseDto,
  })
  findAll(
    @Query() query: FindPeriodsQueryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PeriodsResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.periodsService.findAll(query, schoolId);
  }

  @Permissions(PERIOD_PERMISSIONS.VIEW)
  @Get(':id')
  @ApiOperation({ summary: 'Get a period by ID' })
  @ApiOkResponse({
    description: 'Period retrieved successfully',
    type: PeriodFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Period not found' })
  findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<PeriodFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.periodsService.findOne(id, schoolId);
  }

  @Permissions(PERIOD_PERMISSIONS.EDIT)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a period' })
  @ApiOkResponse({
    description: 'Period updated successfully',
    type: PeriodFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Period not found' })
  @ApiResponse({ status: 409, description: 'Period name or time slot conflict' })
  update(
    @Param('id') id: string,
    @Body() updatePeriodDto: UpdatePeriodDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PeriodFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.periodsService.update(id, schoolId, updatePeriodDto);
  }

  @Permissions(PERIOD_PERMISSIONS.DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a period' })
  @ApiNoContentResponse({ description: 'Period deleted successfully' })
  @ApiResponse({ status: 404, description: 'Period not found' })
  remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    const schoolId = req.headers['schoolid'] as string;
    return this.periodsService.remove(id, schoolId);
  }
}
