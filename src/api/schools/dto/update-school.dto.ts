import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsEnum, IsArray } from 'class-validator';

import { CreateSchoolDto } from './create-school.dto.js';

export enum SchoolType {
  PRIVATE = 'PRIVATE',
  GOVERNMENT = 'GOVERNMENT',
}

export enum EducationSystem {
  MATRIC = 'MATRIC',
  CAMBRIDGE = 'CAMBRIDGE',
  FEDERAL = 'FEDERAL',
  OTHER = 'OTHER',
}

export enum DateFormat {
  DD_MM_YYYY = 'DD/MM/YYYY',
  MM_DD_YYYY = 'MM/DD/YYYY',
  YYYY_MM_DD = 'YYYY-MM-DD',
}

export class UpdateSchoolDto extends PartialType(CreateSchoolDto) {
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  logo?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  shortCode?: string | null;

  @ApiPropertyOptional({ enum: SchoolType, nullable: true })
  @IsOptional()
  @IsEnum(SchoolType)
  schoolType?: SchoolType | null;

  @ApiPropertyOptional({ enum: EducationSystem, nullable: true })
  @IsOptional()
  @IsEnum(EducationSystem)
  educationSystem?: EducationSystem | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  @Type(() => Number)
  establishedYear?: number | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  principalName?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  vicePrincipalName?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  adminContact?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  ownerName?: string | null;

  @ApiPropertyOptional({ enum: DateFormat, nullable: true })
  @IsOptional()
  @IsEnum(DateFormat)
  dateFormat?: DateFormat | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  feeDueDate?: number | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workingDays?: string[];

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  openingTime?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  closingTime?: string | null;
}
