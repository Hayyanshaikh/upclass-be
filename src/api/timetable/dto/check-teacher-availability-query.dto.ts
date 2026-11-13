import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WeekDay } from '../../../generated/prisma/client.ts';

export class CheckTeacherAvailabilityQueryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  teacherId!: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  excludeClassSectionId?: string;
}
