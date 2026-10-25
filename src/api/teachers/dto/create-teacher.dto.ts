import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export const TeacherGender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;
export type TeacherGender = (typeof TeacherGender)[keyof typeof TeacherGender];

export const TeacherMaritalStatus = {
  SINGLE: 'SINGLE',
  MARRIED: 'MARRIED',
  DIVORCED: 'DIVORCED',
  WIDOWED: 'WIDOWED',
} as const;
export type TeacherMaritalStatus =
  (typeof TeacherMaritalStatus)[keyof typeof TeacherMaritalStatus];

export const TeacherEmploymentType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  TEMPORARY: 'TEMPORARY',
} as const;
export type TeacherEmploymentType =
  (typeof TeacherEmploymentType)[keyof typeof TeacherEmploymentType];

export class CreateTeacherDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date | null;

  @ApiPropertyOptional({ enum: TeacherGender })
  @IsOptional()
  @IsEnum(TeacherGender)
  gender?: TeacherGender | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\d{5}-\d{7}-\d$/, { message: 'CNIC must use format 00000-0000000-0.' })
  cnicNo?: string | null;

  @ApiPropertyOptional({ enum: TeacherMaritalStatus })
  @IsOptional()
  @IsEnum(TeacherMaritalStatus)
  maritalStatus?: TeacherMaritalStatus | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  qualification?: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  joiningDate?: Date | null;

  @ApiPropertyOptional({ enum: TeacherEmploymentType })
  @IsOptional()
  @IsEnum(TeacherEmploymentType)
  employmentType?: TeacherEmploymentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string | null;
}
