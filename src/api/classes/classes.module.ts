import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import { ClassesController } from './classes.controller.ts';
import { ClassesService } from './classes.service.ts';

@Module({
  controllers: [ClassesController],
  providers: [ClassesService, PermissionsGuard],
  exports: [ClassesService],
})
export class ClassesModule {}
