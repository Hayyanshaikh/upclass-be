import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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

import { AcademicTermsService } from './academic-terms.service.ts';
import { CreateAcademicTermDto } from './dto/create-academic-term.dto.ts';
import {
  AcademicTermFindOneResponseDto,
  AcademicTermsResponseDto,
} from './dto/academic-terms-response.dto.ts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.ts';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.ts';
import { Permissions } from '../auth/decorators/permissions.decorator.ts';
import { ACADEMIC_TERM_PERMISSIONS } from './entities/academic-term.permission.ts';
import { LookupResponseDto } from '../../common/dto/lookup-response.dto.ts';

@ApiTags('Academic Terms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('academic-terms')
export class AcademicTermsController {
  constructor(private readonly academicTermsService: AcademicTermsService) {}

  @Permissions(ACADEMIC_TERM_PERMISSIONS.CREATE)
  @Post()
  @ApiOperation({ summary: 'Create an academic term' })
  @ApiCreatedResponse({
    description: 'Academic term created successfully',
    type: AcademicTermFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Academic term already exists' })
  create(
    @Body() createAcademicTermDto: CreateAcademicTermDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<AcademicTermFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.academicTermsService.create(createAcademicTermDto, schoolId);
  }

  @Permissions(ACADEMIC_TERM_PERMISSIONS.VIEW)
  @Get()
  @ApiOperation({ summary: 'List academic terms for the school' })
  @ApiOkResponse({
    description: 'Academic terms retrieved successfully',
    type: AcademicTermsResponseDto,
  })
  findAll(@Req() req: AuthenticatedRequest): Promise<AcademicTermsResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.academicTermsService.findAll(schoolId);
  }

  @Permissions(ACADEMIC_TERM_PERMISSIONS.LOOKUP)
  @Get('lookup')
  @ApiOperation({ summary: 'Get academic terms for dropdowns' })
  @ApiOkResponse({ type: LookupResponseDto })
  lookup(@Req() req: AuthenticatedRequest): Promise<LookupResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.academicTermsService.lookup(schoolId);
  }

  @Permissions(ACADEMIC_TERM_PERMISSIONS.VIEW)
  @Get(':id')
  @ApiOperation({ summary: 'Get an academic term by ID' })
  @ApiOkResponse({
    description: 'Academic term retrieved successfully',
    type: AcademicTermFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Academic term not found' })
  findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<AcademicTermFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.academicTermsService.findOne(id, schoolId);
  }

  @Permissions(ACADEMIC_TERM_PERMISSIONS.DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an academic term' })
  @ApiNoContentResponse({ description: 'Academic term deleted successfully' })
  @ApiResponse({ status: 404, description: 'Academic term not found' })
  @ApiResponse({
    status: 409,
    description: 'Academic term is assigned to an academic year',
  })
  remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    const schoolId = req.headers['schoolid'] as string;
    return this.academicTermsService.remove(id, schoolId);
  }
}
