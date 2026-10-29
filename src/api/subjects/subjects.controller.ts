import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SubjectsService } from './subjects.service.ts';
import { CreateSubjectDto } from './dto/create-subject.dto.ts';
import { SubjectFindOneResponseDto } from './dto/subjects-response.dto.ts';
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
}
