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

import { SectionsService } from './sections.service.ts';
import { CreateSectionDto } from './dto/create-section.dto.ts';
import { UpdateSectionDto } from './dto/update-section.dto.ts';
import {
  SectionFindOneResponseDto,
  SectionsResponseDto,
} from './dto/sections-response.dto.ts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.ts';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.ts';
import { Permissions } from '../auth/decorators/permissions.decorator.ts';
import { SECTION_PERMISSIONS } from './entities/section.permission.ts';
import { FindSectionsQueryDto } from './dto/find-sections-query.dto.ts';
import { LookupResponseDto } from '../../common/dto/lookup-response.dto.ts';

@ApiTags('Sections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Permissions(SECTION_PERMISSIONS.CREATE)
  @Post()
  @ApiOperation({ summary: 'Create a section' })
  @ApiCreatedResponse({
    description: 'Section created successfully',
    type: SectionFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Section name already exists' })
  create(
    @Body() createSectionDto: CreateSectionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<SectionFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.sectionsService.create(createSectionDto, schoolId);
  }

  @Permissions(SECTION_PERMISSIONS.VIEW)
  @Get()
  @ApiOperation({ summary: 'List all sections' })
  @ApiOkResponse({
    description: 'Sections retrieved successfully',
    type: SectionsResponseDto,
  })
  findAll(
    @Query() query: FindSectionsQueryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<SectionsResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.sectionsService.findAll(query, schoolId);
  }

  @Get('lookup')
  @Permissions(SECTION_PERMISSIONS.LOOKUP)
  @ApiOperation({ summary: 'Get sections for dropdown' })
  @ApiOkResponse({ type: LookupResponseDto })
  lookup(@Req() req: AuthenticatedRequest) {
    const schoolId = req.headers['schoolid'] as string;
    return this.sectionsService.lookup(schoolId);
  }

  @Permissions(SECTION_PERMISSIONS.VIEW)
  @Get(':id')
  @ApiOperation({ summary: 'Get a section by ID' })
  @ApiOkResponse({
    description: 'Section retrieved successfully',
    type: SectionFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Section not found' })
  findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<SectionFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.sectionsService.findOne(id, schoolId);
  }

  @Permissions(SECTION_PERMISSIONS.DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a section' })
  @ApiNoContentResponse({ description: 'Section deleted successfully' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    const schoolId = req.headers['schoolid'] as string;
    return this.sectionsService.remove(id, schoolId);
  }

  @Permissions(SECTION_PERMISSIONS.EDIT)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a section' })
  @ApiOkResponse({
    description: 'Section updated successfully',
    type: SectionFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Section not found' })
  update(
    @Param('id') id: string,
    @Body() updateSectionDto: UpdateSectionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<SectionFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.sectionsService.update(id, schoolId, updateSectionDto);
  }
}
