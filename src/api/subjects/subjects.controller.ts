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

import { SubjectsService } from './subjects.service.ts';
import { CreateSubjectDto } from './dto/create-subject.dto.ts';
import { UpdateSubjectDto } from './dto/update-subject.dto.ts';
import {
  SubjectFindOneResponseDto,
  SubjectsResponseDto,
} from './dto/subjects-response.dto.ts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.ts';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.ts';
import { Permissions } from '../auth/decorators/permissions.decorator.ts';
import { SUBJECT_PERMISSIONS } from './entities/subject.permission.ts';

@ApiTags('Subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Permissions(SUBJECT_PERMISSIONS.CREATE)
  @Post()
  @ApiOperation({ summary: 'Create a subject' })
  @ApiCreatedResponse({
    description: 'Subject created successfully',
    type: SubjectFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Subject code already exists' })
  create(
    @Body() createSubjectDto: CreateSubjectDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<SubjectFindOneResponseDto> {
    return this.subjectsService.create(createSubjectDto);
  }

  @Permissions(SUBJECT_PERMISSIONS.VIEW)
  @Get()
  @ApiOperation({ summary: 'List all subjects' })
  @ApiOkResponse({
    description: 'Subjects retrieved successfully',
    type: SubjectsResponseDto,
  })
  findAll(@Query() query: { searchKey?: string; type?: string; status?: string; limit?: number; offset?: number }): Promise<SubjectsResponseDto> {
    return this.subjectsService.findAll(query);
  }

  @Permissions(SUBJECT_PERMISSIONS.VIEW)
  @Get(':id')
  @ApiOperation({ summary: 'Get a subject by ID' })
  @ApiOkResponse({
    description: 'Subject retrieved successfully',
    type: SubjectFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  findOne(@Param('id') id: string): Promise<SubjectFindOneResponseDto> {
    return this.subjectsService.findOne(id);
  }

  @Permissions(SUBJECT_PERMISSIONS.DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subject' })
  @ApiNoContentResponse({ description: 'Subject deleted successfully' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.subjectsService.remove(id);
  }

  @Permissions(SUBJECT_PERMISSIONS.EDIT)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a subject' })
  @ApiOkResponse({
    description: 'Subject updated successfully',
    type: SubjectFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  update(
    @Param('id') id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ): Promise<SubjectFindOneResponseDto> {
    return this.subjectsService.update(id, updateSubjectDto);
  }
}
