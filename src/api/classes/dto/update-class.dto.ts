import { PartialType } from '@nestjs/swagger';
import { CreateClassDto } from './create-class.dto.ts';

export class UpdateClassDto extends PartialType(CreateClassDto) {}
