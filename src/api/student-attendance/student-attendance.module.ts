import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import { StudentAttendanceController } from './student-attendance.controller.ts';
import { StudentAttendanceService } from './student-attendance.service.ts';

@Module({
  controllers: [StudentAttendanceController],
  providers: [StudentAttendanceService, PermissionsGuard],
  exports: [StudentAttendanceService],
})
export class StudentAttendanceModule {}
