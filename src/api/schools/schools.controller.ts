import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiResponse,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { SchoolsService } from './schools.service.ts';
import { CreateSchoolDto } from './dto/create-school.dto.ts';
import { UpdateSchoolDto } from './dto/update-school.dto.ts';
import { FindSchoolsQueryDto } from './dto/find-schools-query.dto.ts';
import {
  SchoolFindOneResponseDto,
  SchoolsResponseDto,
} from './dto/schools-response.dto.ts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.ts';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import { Permissions } from '../auth/decorators/permissions.decorator.ts';
import { SCHOOL_PERMISSIONS } from './entities/school.permission.ts';

@ApiTags('Schools')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Permissions(SCHOOL_PERMISSIONS.CREATE)
  @Post()
  @ApiOperation({ summary: 'Create a school' })
  @ApiCreatedResponse({
    description: 'School created successfully',
    type: SchoolFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'School already exists' })
  create(
    @Body() createSchoolDto: CreateSchoolDto,
  ): Promise<SchoolFindOneResponseDto> {
    return this.schoolsService.create(createSchoolDto);
  }

  @Permissions(SCHOOL_PERMISSIONS.VIEW)
  @Get()
  @ApiOperation({ summary: 'Get all schools' })
  @ApiOkResponse({
    description: 'Schools retrieved successfully',
    type: SchoolsResponseDto,
  })
  findAll(@Query() query: FindSchoolsQueryDto): Promise<SchoolsResponseDto> {
    return this.schoolsService.findAll(query);
  }

  @Permissions(SCHOOL_PERMISSIONS.VIEW)
  @Get(':id')
  @ApiOperation({ summary: 'Get a school by ID' })
  @ApiOkResponse({
    description: 'School retrieved successfully',
    type: SchoolFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'School not found' })
  findOne(@Param('id') id: string): Promise<SchoolFindOneResponseDto> {
    return this.schoolsService.findOne(id);
  }

  @Permissions(SCHOOL_PERMISSIONS.EDIT)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a school' })
  @ApiOkResponse({
    description: 'School updated successfully',
    type: SchoolFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'School not found' })
  @ApiResponse({ status: 409, description: 'School already exists' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSchoolDto,
  ): Promise<SchoolFindOneResponseDto> {
    return this.schoolsService.update(id, dto);
  }

  @Permissions(SCHOOL_PERMISSIONS.DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a school' })
  @ApiOkResponse({
    description: 'School deleted successfully',
    type: SchoolFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'School not found' })
  @ApiResponse({ status: 409, description: 'School has associated users' })
  remove(@Param('id') id: string): Promise<SchoolFindOneResponseDto> {
    return this.schoolsService.remove(id);
  }
}
