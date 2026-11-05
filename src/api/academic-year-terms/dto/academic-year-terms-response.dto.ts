import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AcademicYearTermAcademicYearDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  year: string;

  @ApiProperty({ type: Date })
  startDate: Date;

  @ApiProperty({ type: Date })
  endDate: Date;
}

export class AcademicYearTermAcademicTermDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class AcademicYearTermDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  academicYearId: string;

  @ApiProperty()
  academicTermId: string;

  @ApiProperty({ type: Date })
  startDate: Date;

  @ApiProperty({ type: Date })
  endDate: Date;

  @ApiProperty({ type: AcademicYearTermAcademicYearDto })
  academicYear: AcademicYearTermAcademicYearDto;

  @ApiProperty({ type: AcademicYearTermAcademicTermDto })
  academicTerm: AcademicYearTermAcademicTermDto;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}

export class AcademicYearTermsResponseDto {
  @ApiProperty({ type: [AcademicYearTermDto] })
  data: AcademicYearTermDto[];

  @ApiProperty({ description: 'Total assigned terms for the school' })
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiPropertyOptional()
  warning?: string;
}

export class AcademicYearTermFindOneResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: AcademicYearTermDto })
  data: AcademicYearTermDto;

  @ApiPropertyOptional()
  warning?: string;
}
