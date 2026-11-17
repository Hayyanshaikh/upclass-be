import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { TeacherAttendanceStatus } from '../../../generated/prisma/client.ts';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class UpdateTeacherAttendanceDto {
  @ApiPropertyOptional({
    enum: TeacherAttendanceStatus,
    description:
      'Present and Late derive status from check-in time against school opening time',
  })
  @IsOptional()
  @IsEnum(TeacherAttendanceStatus)
  status?: TeacherAttendanceStatus;

  @ApiPropertyOptional({ type: String, example: '08:05' })
  @IsOptional()
  @IsString()
  @Matches(TIME_PATTERN, { message: 'Check-in must use format HH:mm.' })
  checkIn?: string;

  @ApiPropertyOptional({ type: String, example: '15:30' })
  @IsOptional()
  @IsString()
  @Matches(TIME_PATTERN, { message: 'Check-out must use format HH:mm.' })
  checkOut?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  remarks?: string;
}
