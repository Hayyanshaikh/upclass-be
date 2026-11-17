import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TeacherAttendanceSource,
  TeacherAttendanceStatus,
} from '../../../generated/prisma/client.ts';

export class TeacherAttendanceTeacherDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty({ type: String, nullable: true })
  lastName: string | null;

  @ApiProperty({ type: String, nullable: true })
  employeeId: string | null;
}

export class TeacherAttendanceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  schoolId: string;

  @ApiProperty()
  teacherId: string;

  @ApiProperty({ type: Date })
  date: Date;

  @ApiProperty({ enum: TeacherAttendanceStatus })
  status: TeacherAttendanceStatus;

  @ApiProperty({ enum: TeacherAttendanceSource })
  source: TeacherAttendanceSource;

  @ApiProperty({ type: String, nullable: true })
  checkIn: string | null;

  @ApiProperty({ type: String, nullable: true })
  checkOut: string | null;

  @ApiProperty({ type: Number, nullable: true })
  lateMinutes: number | null;

  @ApiProperty({ type: String, nullable: true })
  remarks: string | null;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiPropertyOptional({ type: TeacherAttendanceTeacherDto })
  teacher?: TeacherAttendanceTeacherDto;
}

export class TeacherAttendanceListResponseDto {
  @ApiProperty({ type: [TeacherAttendanceDto] })
  data: TeacherAttendanceDto[];

  @ApiProperty({ description: 'Total attendance records matching the filters' })
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiPropertyOptional()
  warning?: string;
}

export class TeacherAttendanceFindOneResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: TeacherAttendanceDto })
  data: TeacherAttendanceDto;
}

export class MarkAttendanceShiftDto {
  @ApiProperty({ type: String, nullable: true })
  openingTime: string | null;

  @ApiProperty({ type: String, nullable: true })
  closingTime: string | null;
}

export class MarkAttendanceTodayResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: TeacherAttendanceDto, nullable: true })
  data: TeacherAttendanceDto | null;

  @ApiProperty({ type: TeacherAttendanceTeacherDto })
  teacher: TeacherAttendanceTeacherDto;

  @ApiProperty({ type: MarkAttendanceShiftDto })
  shift: MarkAttendanceShiftDto;

  @ApiPropertyOptional()
  warning?: string;
}

export type TeacherAttendanceReportBandStatus = 'Good' | 'Watch' | 'Low';

export class TeacherAttendanceReportRowDto {
  @ApiProperty()
  teacherId: string;

  @ApiProperty()
  teacherName: string;

  @ApiProperty({ type: String, nullable: true })
  employeeId: string | null;

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
  status: TeacherAttendanceReportBandStatus;
}

export class TeacherAttendanceReportResponseDto {
  @ApiProperty({ type: [TeacherAttendanceReportRowDto] })
  data: TeacherAttendanceReportRowDto[];

  @ApiProperty({ description: 'Total teachers matching the report filters' })
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiPropertyOptional()
  warning?: string;
}
