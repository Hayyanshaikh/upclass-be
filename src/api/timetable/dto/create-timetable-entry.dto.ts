import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { WeekDay } from '../../../generated/prisma/client.ts';

export class CreateTimetableEntryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  classSectionId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  academicTermId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  periodId!: string;

  @ApiProperty({ enum: WeekDay })
  @IsEnum(WeekDay)
  day!: WeekDay;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subjectId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  teacherId!: string;
}
