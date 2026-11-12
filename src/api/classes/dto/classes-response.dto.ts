import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClassStatus } from '../../../generated/prisma/client.ts';
import { AcademicYearDto } from '../../academic-years/dto/academic-years-response.dto.ts';

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
