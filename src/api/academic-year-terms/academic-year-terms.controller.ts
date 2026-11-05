import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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

import { AcademicYearTermsService } from './academic-year-terms.service.ts';
import { CreateAcademicYearTermDto } from './dto/create-academic-year-term.dto.ts';
import { AcademicYearTermFiltersDto } from './dto/academic-year-term-filters.dto.ts';
import {
  AcademicYearTermFindOneResponseDto,
  AcademicYearTermsResponseDto,
} from './dto/academic-year-terms-response.dto.ts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.ts';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.ts';
import { Permissions } from '../auth/decorators/permissions.decorator.ts';
import { ACADEMIC_YEAR_TERM_PERMISSIONS } from './entities/academic-year-term.permission.ts';

@ApiTags('Academic Year Terms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('academic-year-terms')
export class AcademicYearTermsController {
  constructor(
    private readonly academicYearTermsService: AcademicYearTermsService,
  ) {}

  @Permissions(ACADEMIC_YEAR_TERM_PERMISSIONS.CREATE)
  @Post()
  @ApiOperation({ summary: 'Assign an academic term to an academic year' })
  @ApiCreatedResponse({
    description: 'Academic term assigned successfully',
    type: AcademicYearTermFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Academic year or term not found' })
  @ApiResponse({
    status: 409,
    description: 'Term already assigned or dates overlap',
  })
  create(
    @Body() createAcademicYearTermDto: CreateAcademicYearTermDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<AcademicYearTermFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.academicYearTermsService.create(
      createAcademicYearTermDto,
      schoolId,
    );
  }

  @Permissions(ACADEMIC_YEAR_TERM_PERMISSIONS.VIEW)
  @Get()
  @ApiOperation({ summary: 'List assigned academic terms for the school' })
  @ApiOkResponse({
    description: 'Academic year terms retrieved successfully',
    type: AcademicYearTermsResponseDto,
  })
  findAll(
    @Query() query: AcademicYearTermFiltersDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<AcademicYearTermsResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.academicYearTermsService.findAll(query, schoolId);
  }

  @Permissions(ACADEMIC_YEAR_TERM_PERMISSIONS.DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Remove an assigned academic term' })
  @ApiNoContentResponse({
    description: 'Academic term assignment removed successfully',
  })
  @ApiResponse({ status: 404, description: 'Academic year term not found' })
  remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    const schoolId = req.headers['schoolid'] as string;
    return this.academicYearTermsService.remove(id, schoolId);
  }
}
