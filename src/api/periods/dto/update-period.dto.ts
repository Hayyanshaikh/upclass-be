import { ApiPropertyOptional } from '@nestjs/swagger';
import { PeriodStatus, PeriodType } from '../../../generated/prisma/client.ts';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class UpdatePeriodDto {
  @ApiPropertyOptional({ example: 'Period 1' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @IsString()
  @Matches(TIME_PATTERN, {
    message: 'Start time must be in HH:mm format.',
  })
  startTime?: string;

  @ApiPropertyOptional({ example: '08:40' })
  @IsOptional()
  @IsString()
  @Matches(TIME_PATTERN, {
    message: 'End time must be in HH:mm format.',
  })
  endTime?: string;

  @ApiPropertyOptional({ enum: PeriodType })
  @IsOptional()
  @IsEnum(PeriodType)
  type?: PeriodType;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  sortOrder?: number;

  @ApiPropertyOptional({ enum: PeriodStatus })
  @IsOptional()
  @IsEnum(PeriodStatus)
  status?: PeriodStatus;
}
