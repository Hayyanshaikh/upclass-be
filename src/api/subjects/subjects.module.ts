import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import { SubjectsController } from './subjects.controller.ts';
import { SubjectsService } from './subjects.service.ts';

@Module({
  controllers: [SubjectsController],
  providers: [SubjectsService, PermissionsGuard],
  exports: [SubjectsService],
})
export class SubjectsModule {}
