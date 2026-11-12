import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import { SectionsController } from './sections.controller.ts';
import { SectionsService } from './sections.service.ts';

@Module({
  controllers: [SectionsController],
  providers: [SectionsService, PermissionsGuard],
  exports: [SectionsService],
})
export class SectionsModule {}
