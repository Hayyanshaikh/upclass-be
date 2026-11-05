import { PartialType } from '@nestjs/swagger';
import { CreateLeavePolicyDto } from './create-leave-policy.dto.ts';

export class UpdateLeavePolicyDto extends PartialType(CreateLeavePolicyDto) {}
