import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

export const REPORT_BANDS = ['all', 'good', 'watch', 'low', 'perfect'] as const;

export type ReportBand = (typeof REPORT_BANDS)[number];

export class ReportTeacherAttendanceQueryDto {
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

  @ApiPropertyOptional({ enum: REPORT_BANDS, default: 'all' })
  @IsOptional()
  @IsIn(REPORT_BANDS)
  band?: ReportBand;
}
