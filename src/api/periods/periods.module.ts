import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import { PeriodsController } from './periods.controller.ts';
import { PeriodsService } from './periods.service.ts';

@Module({
  controllers: [PeriodsController],
  providers: [PeriodsService, PermissionsGuard],
  exports: [PeriodsService],
})
export class PeriodsModule {}
