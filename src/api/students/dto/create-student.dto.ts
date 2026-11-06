import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Gender, StudentStatus } from '../../../generated/prisma/client.ts';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export class CreateStudentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiPropertyOptional({ type: Date, nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date | null;

  @ApiPropertyOptional({ enum: Gender, nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^\d{5}-\d{7}-\d$/, {
    message: 'B-Form / CNIC must use format 00000-0000000-0.',
  })
  identityNumber?: string | null;

  @ApiPropertyOptional({
    type: String,
    enum: BLOOD_GROUPS,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsIn(BLOOD_GROUPS)
  bloodGroup?: string | null;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  classId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  roll!: string;

  @ApiPropertyOptional({ type: Date, nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  admissionDate?: Date | null;

  @ApiPropertyOptional({ enum: StudentStatus })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  guardian!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  relation!: string;

  @ApiProperty()
  @IsString()
  @Matches(/^03\d{2}-?\d{7}$/, {
    message: 'Phone must use format 0300-0000000.',
  })
  phone!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  photo?: string | null;
}
