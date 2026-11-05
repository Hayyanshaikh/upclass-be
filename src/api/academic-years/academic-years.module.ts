import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import { AcademicYearsController } from './academic-years.controller.ts';
import { AcademicYearsService } from './academic-years.service.ts';

@Module({
  controllers: [AcademicYearsController],
  providers: [AcademicYearsService, PermissionsGuard],
  exports: [AcademicYearsService],
})
export class AcademicYearsModule {}
