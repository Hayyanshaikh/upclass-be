import { PartialType } from '@nestjs/swagger';
import { CreateLeavePolicySettingsDto } from './create-leave-policy-settings.dto.ts';

export class UpdateLeavePolicySettingsDto extends PartialType(
  CreateLeavePolicySettingsDto,
) {}
