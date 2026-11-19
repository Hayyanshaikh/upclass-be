import {
  Body,
  Controller,
  Get,
  Post,
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

import { StudentAttendanceService } from './student-attendance.service.ts';
import { FindStudentAttendanceQueryDto } from './dto/find-student-attendance-query.dto.ts';
import { ReportStudentAttendanceQueryDto } from './dto/report-student-attendance-query.dto.ts';
import { SaveStudentAttendanceDto } from './dto/save-student-attendance.dto.ts';
import {
  SaveStudentAttendanceResponseDto,
  StudentAttendanceListResponseDto,
  StudentAttendanceReportResponseDto,
} from './dto/student-attendance-response.dto.ts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.ts';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.ts';
import { Permissions } from '../auth/decorators/permissions.decorator.ts';
import { STUDENT_ATTENDANCE_PERMISSIONS } from './entities/student-attendance.permission.ts';

@ApiTags('Student Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('student-attendance')
export class StudentAttendanceController {
  constructor(
    private readonly studentAttendanceService: StudentAttendanceService,
  ) {}

  @Permissions(STUDENT_ATTENDANCE_PERMISSIONS.VIEW)
  @Get()
  @ApiOperation({ summary: 'List class attendance for a date with student roster' })
  @ApiOkResponse({
    description: 'Student attendance retrieved successfully',
    type: StudentAttendanceListResponseDto,
  })
  findAll(
    @Query() query: FindStudentAttendanceQueryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<StudentAttendanceListResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.studentAttendanceService.findAll(query, schoolId);
  }

  @Permissions(STUDENT_ATTENDANCE_PERMISSIONS.CREATE)
  @Post('bulk')
  @ApiOperation({ summary: 'Save full-day attendance for a class' })
  @ApiOkResponse({
    description: 'Student attendance saved successfully',
    type: SaveStudentAttendanceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  saveBulk(
    @Body() dto: SaveStudentAttendanceDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<SaveStudentAttendanceResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.studentAttendanceService.saveBulk(dto, schoolId);
  }

  @Permissions(STUDENT_ATTENDANCE_PERMISSIONS.VIEW)
  @Get('report')
  @ApiOperation({ summary: 'Monthly student attendance report' })
  @ApiOkResponse({
    description: 'Student attendance report generated successfully',
    type: StudentAttendanceReportResponseDto,
  })
  report(
    @Query() query: ReportStudentAttendanceQueryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<StudentAttendanceReportResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.studentAttendanceService.report(query, schoolId);
  }
}
