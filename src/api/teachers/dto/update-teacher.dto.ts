import { PartialType } from '@nestjs/swagger';
import { CreateTeacherDto } from './create-teacher.dto.ts';

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {}
