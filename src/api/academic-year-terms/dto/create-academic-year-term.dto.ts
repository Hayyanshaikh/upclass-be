import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateAcademicYearTermDto {
  @ApiProperty({ description: 'Academic year ID' })
  @IsString()
  @IsNotEmpty()
  academicYearId!: string;

  @ApiProperty({ description: 'Academic term ID' })
  @IsString()
  @IsNotEmpty()
  academicTermId!: string;

  @ApiProperty({ type: Date, example: '2026-08-01' })
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @ApiProperty({ type: Date, example: '2026-12-20' })
  @Type(() => Date)
  @IsDate()
  endDate!: Date;
}
