import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import { TeacherAttendanceController } from './teacher-attendance.controller.ts';
import { MarkAttendanceController } from './mark-attendance.controller.ts';
import { TeacherAttendanceService } from './teacher-attendance.service.ts';

@Module({
  controllers: [TeacherAttendanceController, MarkAttendanceController],
  providers: [TeacherAttendanceService, PermissionsGuard],
  exports: [TeacherAttendanceService],
})
export class TeacherAttendanceModule {}
