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

import { TimetableService } from './timetable.service.ts';
import { CreateTimetableEntryDto } from './dto/create-timetable-entry.dto.ts';
import { UpdateTimetableEntryDto } from './dto/update-timetable-entry.dto.ts';
import { FindTimetableQueryDto } from './dto/find-timetable-query.dto.ts';
import {
  TimetableEntriesResponseDto,
  TimetableEntryFindOneResponseDto,
} from './dto/timetable-response.dto.ts';
import { TimetableClassSectionsResponseDto } from './dto/class-sections-response.dto.ts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.ts';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.ts';
import { Permissions } from '../auth/decorators/permissions.decorator.ts';
import { TIMETABLE_PERMISSIONS } from './entities/timetable.permission.ts';

@ApiTags('Timetable')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Permissions(TIMETABLE_PERMISSIONS.CREATE)
  @Post()
  @ApiOperation({ summary: 'Assign a period to a class' })
  @ApiCreatedResponse({
    description: 'Timetable entry created successfully',
    type: TimetableEntryFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Slot or teacher conflict' })
  create(
    @Body() createTimetableEntryDto: CreateTimetableEntryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<TimetableEntryFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.timetableService.create(createTimetableEntryDto, schoolId);
  }

  @Permissions(TIMETABLE_PERMISSIONS.VIEW)
  @Get()
  @ApiOperation({ summary: 'List timetable entries' })
  @ApiOkResponse({
    description: 'Timetable entries retrieved successfully',
    type: TimetableEntriesResponseDto,
  })
  findAll(
    @Query() query: FindTimetableQueryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<TimetableEntriesResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.timetableService.findAll(query, schoolId);
  }

  @Permissions(TIMETABLE_PERMISSIONS.LOOKUP)
  @Get('class-sections')
  @ApiOperation({ summary: 'List class section options for timetable' })
  @ApiOkResponse({
    description: 'Class sections retrieved successfully',
    type: TimetableClassSectionsResponseDto,
  })
  findClassSections(
    @Req() req: AuthenticatedRequest,
  ): Promise<TimetableClassSectionsResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.timetableService.findClassSections(schoolId);
  }

  @Permissions(TIMETABLE_PERMISSIONS.EDIT)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a timetable entry' })
  @ApiOkResponse({
    description: 'Timetable entry updated successfully',
    type: TimetableEntryFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Timetable entry not found' })
  @ApiResponse({ status: 409, description: 'Teacher conflict' })
  update(
    @Param('id') id: string,
    @Body() updateTimetableEntryDto: UpdateTimetableEntryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<TimetableEntryFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.timetableService.update(id, schoolId, updateTimetableEntryDto);
  }

  @Permissions(TIMETABLE_PERMISSIONS.DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Clear a timetable entry' })
  @ApiNoContentResponse({ description: 'Timetable entry deleted successfully' })
  @ApiResponse({ status: 404, description: 'Timetable entry not found' })
  remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    const schoolId = req.headers['schoolid'] as string;
    return this.timetableService.remove(id, schoolId);
  }
}
