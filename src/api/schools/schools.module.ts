import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import { SchoolsController } from './schools.controller.ts';
import { SchoolsService } from './schools.service.ts';

@Module({
  controllers: [SchoolsController],
  providers: [SchoolsService, PermissionsGuard],
  exports: [SchoolsService],
})
export class SchoolsModule {}