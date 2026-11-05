import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import { LeavePoliciesController } from './leave-policies.controller.ts';
import { LeavePolicySettingsController } from './leave-policy-settings.controller.ts';
import { LeavePoliciesService } from './leave-policies.service.ts';
import { LeavePolicySettingsService } from './leave-policy-settings.service.ts';

@Module({
  controllers: [LeavePoliciesController, LeavePolicySettingsController],
  providers: [
    LeavePoliciesService,
    LeavePolicySettingsService,
    PermissionsGuard,
  ],
  exports: [LeavePoliciesService, LeavePolicySettingsService],
})
export class LeavePoliciesModule {}
