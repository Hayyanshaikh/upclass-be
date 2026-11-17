import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
import {
  MarkAttendanceTodayResponseDto,
  TeacherAttendanceFindOneResponseDto,
  TeacherAttendanceListResponseDto,
} from './dto/teacher-attendance-response.dto.ts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.ts';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.ts';
import { Permissions } from '../auth/decorators/permissions.decorator.ts';
import { MARK_ATTENDANCE_PERMISSIONS } from './entities/teacher-attendance.permission.ts';

@ApiTags('Mark Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('mark-attendance')
export class MarkAttendanceController {
  constructor(
    private readonly teacherAttendanceService: TeacherAttendanceService,
  ) {}

  @Permissions(MARK_ATTENDANCE_PERMISSIONS.VIEW)
  @Get('today')
  @ApiOperation({ summary: "Get today's attendance for the signed-in teacher" })
  @ApiOkResponse({
    description: "Today's attendance retrieved successfully",
    type: MarkAttendanceTodayResponseDto,
  })
  findToday(
    @Req() req: AuthenticatedRequest,
  ): Promise<MarkAttendanceTodayResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.teacherAttendanceService.findToday(req.user.id, schoolId);
  }

  @Permissions(MARK_ATTENDANCE_PERMISSIONS.VIEW)
  @Get('weekly')
  @ApiOperation({
    summary: 'Get this week attendance for the signed-in teacher',
  })
  @ApiOkResponse({
    description: 'Weekly attendance retrieved successfully',
    type: TeacherAttendanceListResponseDto,
  })
  findWeekly(
    @Req() req: AuthenticatedRequest,
  ): Promise<TeacherAttendanceListResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.teacherAttendanceService.findWeekly(req.user.id, schoolId);
  }

  @Permissions(MARK_ATTENDANCE_PERMISSIONS.CREATE)
  @Post('check-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check in for today' })
  @ApiOkResponse({
    description: 'Checked in successfully',
    type: TeacherAttendanceFindOneResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Not a working day, school timings are not set, or check-in is outside school hours',
  })
  @ApiResponse({ status: 409, description: 'Already checked in today' })
  checkIn(
    @Req() req: AuthenticatedRequest,
  ): Promise<TeacherAttendanceFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.teacherAttendanceService.checkIn(req.user.id, schoolId);
  }

  @Permissions(MARK_ATTENDANCE_PERMISSIONS.CREATE)
  @Post('check-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check out for today' })
  @ApiOkResponse({
    description: 'Checked out successfully',
    type: TeacherAttendanceFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Check-in is required first' })
  @ApiResponse({ status: 409, description: 'Already checked out today' })
  checkOut(
    @Req() req: AuthenticatedRequest,
  ): Promise<TeacherAttendanceFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.teacherAttendanceService.checkOut(req.user.id, schoolId);
  }
}
