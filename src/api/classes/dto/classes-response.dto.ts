import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClassStatus } from '../../../generated/prisma/client.ts';
import { AcademicYearDto } from '../../academic-years/dto/academic-years-response.dto.ts';
import { SectionDto } from '../../sections/dto/sections-response.dto.ts';

export class ClassSectionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sectionId: string;

  @ApiProperty({ type: SectionDto })
  section: SectionDto;

  @ApiProperty()
  teacherId: string;

  @ApiProperty({ type: String, nullable: true })
  room: string | null;

  @ApiProperty({ type: Number, nullable: true })
  capacity: number | null;
}

export class ClassDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  academicYearId: string;

  @ApiProperty({ type: AcademicYearDto })
  academicYear: AcademicYearDto;

  @ApiProperty({ enum: ClassStatus })
  status: ClassStatus;

  @ApiProperty({ type: [ClassSectionDto] })
  sections: ClassSectionDto[];

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}

export class ClassFindOneResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: ClassDto })
  data: ClassDto;

  @ApiPropertyOptional()
  warning?: string;
}
