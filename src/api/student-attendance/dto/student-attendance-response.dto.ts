import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StudentAttendanceStatus } from '../../../generated/prisma/client.ts';

export class StudentAttendanceRowDto {
  @ApiProperty()
  studentId: string;

  @ApiProperty({ type: String, nullable: true })
  attendanceId: string | null;

  @ApiProperty()
  roll: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  classId: string;

  @ApiProperty()
  className: string;

  @ApiProperty({ enum: StudentAttendanceStatus, nullable: true })
  status: StudentAttendanceStatus | null;

  @ApiProperty({ type: String, nullable: true })
  remarks: string | null;
}

export class StudentAttendanceListResponseDto {
  @ApiProperty({ type: [StudentAttendanceRowDto] })
  data: StudentAttendanceRowDto[];

  @ApiProperty({ description: 'Total active students in the class' })
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;
}

export class SaveStudentAttendanceResultDto {
  @ApiProperty({ description: 'Number of attendance records saved' })
  saved: number;
}

export class SaveStudentAttendanceResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: SaveStudentAttendanceResultDto })
  data: SaveStudentAttendanceResultDto;
}

export type StudentAttendanceReportBandStatus = 'Good' | 'Watch' | 'Low';

export class StudentAttendanceReportRowDto {
  @ApiProperty()
  studentId: string;

  @ApiProperty()
  roll: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  days: number;

  @ApiProperty()
  present: number;

  @ApiProperty()
  absent: number;

  @ApiProperty()
  late: number;

  @ApiProperty()
  leave: number;

  @ApiProperty()
  percent: number;

  @ApiProperty({ enum: ['Good', 'Watch', 'Low'] })
  status: StudentAttendanceReportBandStatus;
}

export class StudentAttendanceReportSummaryDto {
  @ApiProperty()
  averagePercent: number;

  @ApiProperty()
  workingDays: number;

  @ApiProperty()
  below75Count: number;

  @ApiProperty()
  perfectCount: number;

  @ApiProperty()
  totalStudents: number;
}

export class StudentAttendanceReportResponseDto {
  @ApiProperty({ type: [StudentAttendanceReportRowDto] })
  data: StudentAttendanceReportRowDto[];

  @ApiProperty({ description: 'Total students matching the report band' })
  total: number;

  @ApiProperty({ type: StudentAttendanceReportSummaryDto })
  summary: StudentAttendanceReportSummaryDto;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiPropertyOptional()
  warning?: string;
}
