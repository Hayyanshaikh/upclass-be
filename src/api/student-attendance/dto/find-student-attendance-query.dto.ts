import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class FindStudentAttendanceQueryDto {
  @ApiProperty({
    type: String,
    description: 'Class ID',
  })
  @IsString()
  @IsNotEmpty()
  classId!: string;

  @ApiPropertyOptional({ type: String, description: 'Class section ID' })
  @IsOptional()
  @IsString()
  classSectionId?: string;

  @ApiProperty({
    type: String,
    example: '2026-11-18',
    description: 'Attendance date (YYYY-MM-DD)',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must use format YYYY-MM-DD.',
  })
  date!: string;

  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    description: 'Maximum number of students to return',
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
    description: 'Number of students to skip',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
