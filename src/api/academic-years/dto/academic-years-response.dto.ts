import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AcademicYearStatus } from '../../../generated/prisma/client.ts';

export class AcademicYearDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  year: string;

  @ApiProperty({ type: Date })
  startDate: Date;

  @ApiProperty({ type: Date })
  endDate: Date;

  @ApiProperty({ enum: AcademicYearStatus })
  status: AcademicYearStatus;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}

export class AcademicYearsResponseDto {
  @ApiProperty({ type: [AcademicYearDto] })
  data: AcademicYearDto[];

  @ApiProperty({ description: 'Total academic years for the school' })
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiPropertyOptional()
  warning?: string;
}

export class AcademicYearFindOneResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: AcademicYearDto })
  data: AcademicYearDto;

  @ApiPropertyOptional()
  warning?: string;
}
