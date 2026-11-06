import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StudentStatus } from '../../../generated/prisma/client.ts';

export class FindStudentsQueryDto {
  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    description: 'Maximum number of students to return',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @Type(() => String)
  @IsString()
  searchKey?: string;

  @ApiPropertyOptional({
    type: Number,
    minimum: 0,
    default: 0,
    description: 'Number of students to skip',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({
    description: 'Filter students by class ID',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  classId?: string;

  @ApiPropertyOptional({ enum: StudentStatus })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;
}
