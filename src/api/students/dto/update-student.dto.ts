import { PartialType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto.ts';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {}
