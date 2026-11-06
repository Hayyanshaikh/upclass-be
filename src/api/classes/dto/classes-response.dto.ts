import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClassStatus } from '../../../generated/prisma/client.ts';
import { AcademicYearDto } from '../../academic-years/dto/academic-years-response.dto.ts';
import { SubjectDto } from '../../subjects/dto/subjects-response.dto.ts';

export class ClassSubjectDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  classId: string;

  @ApiProperty()
  subjectId: string;

  @ApiProperty({ type: SubjectDto })
  subject: SubjectDto;

  @ApiProperty()
  teacherId: string;

  @ApiProperty()
  periodsPerWeek: number;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}

export class ClassDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  section: string;

  @ApiProperty()
  room: string;

  @ApiProperty()
  capacity: number;

  @ApiProperty()
  academicYearId: string;

  @ApiProperty({ type: AcademicYearDto })
  academicYear: AcademicYearDto;

  @ApiProperty({ enum: ClassStatus })
  status: ClassStatus;

  @ApiProperty()
  teacherId: string;

  @ApiProperty({ type: String, nullable: true })
  assistantTeacherId: string | null;

  @ApiProperty({ type: [ClassSubjectDto] })
  subjects: ClassSubjectDto[];

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
