import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  SubjectStatus,
  SubjectType,
} from '../../../generated/prisma/client.ts';

export class FindSubjectsQueryDto {
  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    description: 'Maximum number of subjects to return',
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
    description: 'Number of subjects to skip',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ enum: SubjectType })
  @IsOptional()
  @IsEnum(SubjectType)
  type?: SubjectType;

  @ApiPropertyOptional({ enum: SubjectStatus })
  @IsOptional()
  @IsEnum(SubjectStatus)
  status?: SubjectStatus;
}