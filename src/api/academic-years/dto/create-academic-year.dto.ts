import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AcademicYearStatus } from '../../../generated/prisma/client.ts';

export class CreateAcademicYearDto {
  @ApiProperty({ example: '2026-2027' })
  @IsString()
  @IsNotEmpty()
  year!: string;

  @ApiProperty({ type: Date, example: '2026-08-01' })
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @ApiProperty({ type: Date, example: '2027-06-30' })
  @Type(() => Date)
  @IsDate()
  endDate!: Date;

  @ApiPropertyOptional({
    enum: AcademicYearStatus,
    default: AcademicYearStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(AcademicYearStatus)
  status?: AcademicYearStatus;
}
