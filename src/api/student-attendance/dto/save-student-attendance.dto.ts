import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { StudentAttendanceStatus } from '../../../generated/prisma/client.ts';

export class StudentAttendanceRecordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty({ enum: StudentAttendanceStatus })
  @IsEnum(StudentAttendanceStatus)
  status!: StudentAttendanceStatus;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class SaveStudentAttendanceDto {
  @ApiProperty({ type: String, example: '2026-11-18' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must use format YYYY-MM-DD.',
  })
  date!: string;

  @ApiProperty({ type: String, description: 'Class ID' })
  @IsString()
  @IsNotEmpty()
  classId!: string;

  @ApiProperty({ type: [StudentAttendanceRecordDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Mark attendance for at least one student.' })
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceRecordDto)
  records!: StudentAttendanceRecordDto[];
}
