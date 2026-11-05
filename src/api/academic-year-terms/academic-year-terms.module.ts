import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import { AcademicYearTermsController } from './academic-year-terms.controller.ts';
import { AcademicYearTermsService } from './academic-year-terms.service.ts';

@Module({
  controllers: [AcademicYearTermsController],
  providers: [AcademicYearTermsService, PermissionsGuard],
  exports: [AcademicYearTermsService],
})
export class AcademicYearTermsModule {}
