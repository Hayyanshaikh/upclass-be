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

import { AcademicYearsService } from './academic-years.service.ts';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto.ts';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto.ts';
import {
  AcademicYearFindOneResponseDto,
  AcademicYearsResponseDto,
} from './dto/academic-years-response.dto.ts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.ts';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.ts';
import { Permissions } from '../auth/decorators/permissions.decorator.ts';
import { ACADEMIC_YEAR_PERMISSIONS } from './entities/academic-year.permission.ts';
import { LookupResponseDto } from '../../common/dto/lookup-response.dto.ts';

@ApiTags('Academic Years')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('academic-years')
export class AcademicYearsController {
  constructor(private readonly academicYearsService: AcademicYearsService) {}

  @Permissions(ACADEMIC_YEAR_PERMISSIONS.CREATE)
  @Post()
  @ApiOperation({ summary: 'Create an academic year' })
  @ApiCreatedResponse({
    description: 'Academic year created successfully',
    type: AcademicYearFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Academic year already exists' })
  create(
    @Body() createAcademicYearDto: CreateAcademicYearDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<AcademicYearFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.academicYearsService.create(createAcademicYearDto, schoolId);
  }

  @Permissions(ACADEMIC_YEAR_PERMISSIONS.VIEW)
  @Get()
  @ApiOperation({ summary: 'List academic years for the school' })
  @ApiOkResponse({
    description: 'Academic years retrieved successfully',
    type: AcademicYearsResponseDto,
  })
  findAll(@Req() req: AuthenticatedRequest): Promise<AcademicYearsResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.academicYearsService.findAll(schoolId);
  }

  @Permissions(ACADEMIC_YEAR_PERMISSIONS.LOOKUP)
  @Get('lookup')
  @ApiOperation({ summary: 'Get academic years for dropdowns' })
  @ApiOkResponse({ type: LookupResponseDto })
  lookup(@Req() req: AuthenticatedRequest): Promise<LookupResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.academicYearsService.lookup(schoolId);
  }

  @Permissions(ACADEMIC_YEAR_PERMISSIONS.VIEW)
  @Get(':id')
  @ApiOperation({ summary: 'Get an academic year by ID' })
  @ApiOkResponse({
    description: 'Academic year retrieved successfully',
    type: AcademicYearFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<AcademicYearFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.academicYearsService.findOne(id, schoolId);
  }

  @Permissions(ACADEMIC_YEAR_PERMISSIONS.EDIT)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an academic year' })
  @ApiOkResponse({
    description: 'Academic year updated successfully',
    type: AcademicYearFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  @ApiResponse({
    status: 409,
    description: 'Academic year already exists or another year is active',
  })
  update(
    @Param('id') id: string,
    @Body() updateAcademicYearDto: UpdateAcademicYearDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<AcademicYearFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.academicYearsService.update(
      id,
      schoolId,
      updateAcademicYearDto,
    );
  }

  @Permissions(ACADEMIC_YEAR_PERMISSIONS.DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an academic year' })
  @ApiNoContentResponse({ description: 'Academic year deleted successfully' })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  @ApiResponse({
    status: 409,
    description: 'Academic year has assigned terms',
  })
  remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    const schoolId = req.headers['schoolid'] as string;
    return this.academicYearsService.remove(id, schoolId);
  }
}
