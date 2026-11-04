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

import { ClassesService } from './classes.service.ts';
import type { ClassesListResponse } from './classes.service.ts';
import { CreateClassDto } from './dto/create-class.dto.ts';
import { UpdateClassDto } from './dto/update-class.dto.ts';
import { ClassFiltersDto } from './dto/class-filters.dto.ts';
import { ClassFindOneResponseDto } from './dto/classes-response.dto.ts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.ts';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.ts';
import { Permissions } from '../auth/decorators/permissions.decorator.ts';
import { CLASS_PERMISSIONS } from './entities/class.permission.ts';
import { LookupResponseDto } from '../../common/dto/lookup-response.dto.ts';

@ApiTags('Classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Permissions(CLASS_PERMISSIONS.CREATE)
  @Post()
  @ApiOperation({ summary: 'Create a class' })
  @ApiCreatedResponse({
    description: 'Class created successfully',
    type: ClassFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Class already exists' })
  create(
    @Body() createClassDto: CreateClassDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ClassFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.classesService.create(createClassDto, schoolId);
  }

  @Permissions(CLASS_PERMISSIONS.VIEW)
  @Get()
  @ApiOperation({ summary: 'Get all classes' })
  @ApiOkResponse({
    description: 'Classes retrieved successfully',
  })
  findAll(
    @Query() query: ClassFiltersDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ClassesListResponse> {
    const schoolId = req.headers['schoolid'] as string;
    return this.classesService.findAll(query, schoolId);
  }

  @Get('lookup')
  @Permissions(CLASS_PERMISSIONS.LOOKUP)
  @ApiOperation({ summary: 'Get classes for dropdown' })
  @ApiOkResponse({ type: LookupResponseDto })
  lookup(@Req() req: AuthenticatedRequest) {
    const schoolId = req.headers['schoolid'] as string;
    return this.classesService.lookup(schoolId);
  }

  @Permissions(CLASS_PERMISSIONS.VIEW)
  @Get(':id')
  @ApiOperation({ summary: 'Get a class by ID' })
  @ApiOkResponse({
    description: 'Class retrieved successfully',
    type: ClassFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Class not found' })
  findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<ClassFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.classesService.findOne(id, schoolId);
  }

  @Permissions(CLASS_PERMISSIONS.EDIT)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a class' })
  @ApiOkResponse({
    description: 'Class updated successfully',
    type: ClassFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 409, description: 'Class already exists' })
  update(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ClassFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.classesService.update(id, schoolId, updateClassDto);
  }

  @Permissions(CLASS_PERMISSIONS.DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a class' })
  @ApiNoContentResponse({ description: 'Class deleted successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    const schoolId = req.headers['schoolid'] as string;
    return this.classesService.remove(id, schoolId);
  }
}
