import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import { AcademicTermsController } from './academic-terms.controller.ts';
import { AcademicTermsService } from './academic-terms.service.ts';

@Module({
  controllers: [AcademicTermsController],
  providers: [AcademicTermsService, PermissionsGuard],
  exports: [AcademicTermsService],
})
export class AcademicTermsModule {}
