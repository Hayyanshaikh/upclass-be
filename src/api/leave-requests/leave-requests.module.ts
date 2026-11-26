import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import { LeaveRequestsController } from './leave-requests.controller.ts';
import { LeaveRequestsService } from './leave-requests.service.ts';

@Module({
  controllers: [LeaveRequestsController],
  providers: [LeaveRequestsService, PermissionsGuard],
})
export class LeaveRequestsModule {}
