import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, StudentStatus } from '../../../generated/prisma/client.ts';

export class StudentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  schoolId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ type: Date, nullable: true })
  dateOfBirth: Date | null;

  @ApiProperty({ enum: Gender, nullable: true })
  gender: Gender | null;

  @ApiProperty({ type: String, nullable: true })
  identityNumber: string | null;

  @ApiProperty({ type: String, nullable: true })
  bloodGroup: string | null;

  @ApiProperty()
  classId: string;

  @ApiProperty()
  roll: string;

  @ApiProperty({ type: Date, nullable: true })
  admissionDate: Date | null;

  @ApiProperty({ enum: StudentStatus })
  status: StudentStatus;

  @ApiProperty()
  guardian: string;

  @ApiProperty()
  relation: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ type: String, nullable: true })
  email: string | null;

  @ApiProperty({ type: String, nullable: true })
  address: string | null;

  @ApiProperty({ type: String, nullable: true })
  photo: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class StudentResponseDto {
  @ApiProperty({ type: [StudentDto] })
  data: StudentDto[];

  @ApiProperty({ description: 'Total students matching the filters' })
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiPropertyOptional()
  warning?: string;
}

export class StudentFindOneResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: StudentDto })
  data: StudentDto;

  @ApiPropertyOptional()
  warning?: string;
}
