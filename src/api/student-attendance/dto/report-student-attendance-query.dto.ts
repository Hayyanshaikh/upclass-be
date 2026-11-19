import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export const STUDENT_ATTENDANCE_REPORT_BANDS = [
  'all',
  'good',
  'watch',
  'low',
  'perfect',
] as const;

export type StudentAttendanceReportBand =
  (typeof STUDENT_ATTENDANCE_REPORT_BANDS)[number];

export class ReportStudentAttendanceQueryDto {
  @ApiProperty({
    type: String,
    example: '2026-11',
    description: 'Month to report on (YYYY-MM)',
  })
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'Month must use format YYYY-MM.',
  })
  month!: string;

  @ApiProperty({ type: String, description: 'Class ID' })
  @IsString()
  @IsNotEmpty()
  classId!: string;

  @ApiPropertyOptional({ type: String, description: 'Class section ID' })
  @IsOptional()
  @IsString()
  classSectionId?: string;

  @ApiPropertyOptional({
    enum: STUDENT_ATTENDANCE_REPORT_BANDS,
    default: 'all',
  })
  @IsOptional()
  @IsIn(STUDENT_ATTENDANCE_REPORT_BANDS)
  band?: StudentAttendanceReportBand;

  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    description: 'Maximum number of report rows to return',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    type: Number,
    minimum: 0,
    default: 0,
    description: 'Number of report rows to skip',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
