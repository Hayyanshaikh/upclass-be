import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WeekDay } from '../../../generated/prisma/client.ts';

export class TimetableEntryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  schoolId: string;

  @ApiProperty()
  classSectionId: string;

  @ApiProperty()
  academicTermId: string;

  @ApiProperty()
  periodId: string;

  @ApiProperty({ enum: WeekDay })
  day: WeekDay;

  @ApiProperty()
  subjectId: string;

  @ApiProperty()
  teacherId: string;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}

export class TimetableEntriesResponseDto {
  @ApiProperty({ type: [TimetableEntryDto] })
  data: TimetableEntryDto[];

  @ApiProperty({ description: 'Total timetable entries matching the filters' })
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiPropertyOptional()
  warning?: string;
}

export class TimetableEntryFindOneResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: TimetableEntryDto })
  data: TimetableEntryDto;
}
