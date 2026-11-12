import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PeriodStatus, PeriodType } from '../../../generated/prisma/client.ts';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreatePeriodDto {
  @ApiProperty({ example: 'Period 1' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '08:00' })
  @IsString()
  @Matches(TIME_PATTERN, {
    message: 'Start time must be in HH:mm format.',
  })
  startTime!: string;

  @ApiProperty({ example: '08:40' })
  @IsString()
  @Matches(TIME_PATTERN, {
    message: 'End time must be in HH:mm format.',
  })
  endTime!: string;

  @ApiPropertyOptional({ enum: PeriodType, default: PeriodType.PERIOD })
  @IsOptional()
  @IsEnum(PeriodType)
  type?: PeriodType;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  sortOrder!: number;

  @ApiPropertyOptional({ enum: PeriodStatus, default: PeriodStatus.ACTIVE })
  @IsOptional()
  @IsEnum(PeriodStatus)
  status?: PeriodStatus;
}
