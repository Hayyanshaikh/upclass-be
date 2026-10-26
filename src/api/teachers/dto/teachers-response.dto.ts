import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EmploymentType,
  Gender,
  MaritalStatus,
} from '../../../generated/prisma/client.ts';

export class TeacherDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty({ type: String, nullable: true })
  lastName: string | null;

  @ApiProperty({ type: String, nullable: true })
  employeeId: string | null;

  @ApiProperty({ type: String, nullable: true })
  image: string | null;

  @ApiProperty({ type: String, nullable: true })
  imagePublicId: string | null;

  @ApiProperty({ type: Date, nullable: true })
  dateOfBirth: Date | null;

  @ApiProperty({ enum: Gender, nullable: true })
  gender: Gender | null;

  @ApiProperty({ type: String, nullable: true })
  cnicNo: string | null;

  @ApiProperty({ enum: MaritalStatus, nullable: true })
  maritalStatus: MaritalStatus | null;

  @ApiProperty({ type: String, nullable: true })
  qualification: string | null;

  @ApiProperty({ type: Date, nullable: true })
  joiningDate: Date | null;

  @ApiProperty({ enum: EmploymentType, nullable: true })
  employmentType: EmploymentType | null;

  @ApiProperty({ type: Boolean, nullable: true })
  isActive: boolean | null;

  @ApiProperty({ type: String, nullable: true })
  phone: string | null;

  @ApiProperty({ type: String, nullable: true })
  email: string | null;

  @ApiProperty({ type: String, nullable: true })
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

  @ApiPropertyOptional({
    description: 'One-time password returned on teacher creation',
  })
  temporaryPassword?: string;

  @ApiPropertyOptional()
  warning?: string;
}
