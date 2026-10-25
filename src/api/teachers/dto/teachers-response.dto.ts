import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TeacherEmploymentType,
  TeacherGender,
  TeacherMaritalStatus,
} from './create-teacher.dto.ts';

export class TeacherDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  firstName: string;

  @ApiPropertyOptional({ nullable: true })
  lastName: string | null;

  @ApiPropertyOptional({ nullable: true })
  employeeId: string | null;

  @ApiPropertyOptional({ nullable: true })
  image: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  dateOfBirth: Date | null;

  @ApiPropertyOptional({ enum: TeacherGender, nullable: true })
  gender: TeacherGender | null;

  @ApiPropertyOptional({ nullable: true })
  cnicNo: string | null;

  @ApiPropertyOptional({ enum: TeacherMaritalStatus, nullable: true })
  maritalStatus: TeacherMaritalStatus | null;

  @ApiPropertyOptional({ nullable: true })
  qualification: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  joiningDate: Date | null;

  @ApiPropertyOptional({ enum: TeacherEmploymentType, nullable: true })
  employmentType: TeacherEmploymentType | null;

  @ApiPropertyOptional({ nullable: true })
  isActive: boolean | null;

  @ApiPropertyOptional({ nullable: true })
  phone: string | null;

  @ApiPropertyOptional({ nullable: true })
  email: string | null;

  @ApiPropertyOptional({ nullable: true })
  address: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class TeacherResponseDto {
  @ApiProperty({ type: [TeacherDto] })
  data: TeacherDto[];

  @ApiProperty({ description: 'Total teachers matching the filters' })
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiPropertyOptional()
  warning?: string;
}

export class TeacherFindOneResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: TeacherDto })
  data: TeacherDto;

  @ApiPropertyOptional()
  warning?: string;
}
