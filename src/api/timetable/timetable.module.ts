import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import { TimetableController } from './timetable.controller.ts';
import { TimetableService } from './timetable.service.ts';

@Module({
  controllers: [TimetableController],
  providers: [TimetableService, PermissionsGuard],
  exports: [TimetableService],
})
export class TimetableModule {}
