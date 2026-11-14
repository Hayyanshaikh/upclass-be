import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { TeacherAttendanceService } from './teacher-attendance.service.ts';
import { FindTeacherAttendanceQueryDto } from './dto/find-teacher-attendance-query.dto.ts';
import { ReportTeacherAttendanceQueryDto } from './dto/report-teacher-attendance-query.dto.ts';
import { UpdateTeacherAttendanceDto } from './dto/update-teacher-attendance.dto.ts';
import {
  TeacherAttendanceFindOneResponseDto,
  TeacherAttendanceListResponseDto,
  TeacherAttendanceReportResponseDto,
} from './dto/teacher-attendance-response.dto.ts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.ts';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.ts';
import { Permissions } from '../auth/decorators/permissions.decorator.ts';
import { TEACHER_ATTENDANCE_PERMISSIONS } from './entities/teacher-attendance.permission.ts';

@ApiTags('Teacher Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('teacher-attendance')
export class TeacherAttendanceController {
  constructor(
    private readonly teacherAttendanceService: TeacherAttendanceService,
  ) {}

  @Permissions(TEACHER_ATTENDANCE_PERMISSIONS.VIEW)
  @Get()
  @ApiOperation({ summary: 'List teacher attendance records' })
  @ApiOkResponse({
    description: 'Teacher attendance retrieved successfully',
    type: TeacherAttendanceListResponseDto,
  })
  findAll(
    @Query() query: FindTeacherAttendanceQueryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<TeacherAttendanceListResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.teacherAttendanceService.findAll(query, schoolId);
  }

  @Permissions(TEACHER_ATTENDANCE_PERMISSIONS.VIEW)
  @Get('report')
  @ApiOperation({ summary: 'Monthly teacher attendance report' })
  @ApiOkResponse({
    description: 'Teacher attendance report generated successfully',
    type: TeacherAttendanceReportResponseDto,
  })
  report(
    @Query() query: ReportTeacherAttendanceQueryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<TeacherAttendanceReportResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.teacherAttendanceService.report(query, schoolId);
  }

  @Permissions(TEACHER_ATTENDANCE_PERMISSIONS.VIEW)
  @Get(':id')
  @ApiOperation({ summary: 'Get a teacher attendance record' })
  @ApiOkResponse({
    description: 'Teacher attendance retrieved successfully',
    type: TeacherAttendanceFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Teacher attendance not found' })
  findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<TeacherAttendanceFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.teacherAttendanceService.findOne(id, schoolId);
  }

  @Permissions(TEACHER_ATTENDANCE_PERMISSIONS.EDIT)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a teacher attendance record' })
  @ApiOkResponse({
    description: 'Teacher attendance updated successfully',
    type: TeacherAttendanceFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Teacher attendance not found' })
  update(
    @Param('id') id: string,
    @Body() updateTeacherAttendanceDto: UpdateTeacherAttendanceDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<TeacherAttendanceFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.teacherAttendanceService.update(
      id,
      schoolId,
      updateTeacherAttendanceDto,
    );
  }

  @Permissions(TEACHER_ATTENDANCE_PERMISSIONS.DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a teacher attendance record' })
  @ApiOkResponse({
    description: 'Teacher attendance deleted successfully',
    type: TeacherAttendanceFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Teacher attendance not found' })
  remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<TeacherAttendanceFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.teacherAttendanceService.remove(id, schoolId);
  }
}
