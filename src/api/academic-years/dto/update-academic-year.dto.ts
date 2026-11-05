import { PartialType } from '@nestjs/swagger';
import { CreateAcademicYearDto } from './create-academic-year.dto.ts';

export class UpdateAcademicYearDto extends PartialType(CreateAcademicYearDto) {}
