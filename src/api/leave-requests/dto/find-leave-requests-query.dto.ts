import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { LeaveRequestStatus } from '../../../generated/prisma/client.ts';

export class FindLeaveRequestsQueryDto {
  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    description: 'Maximum number of leave requests to return',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    type: Number,
    minimum: 0,
    default: 0,
    description: 'Number of leave requests to skip',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Teacher name or employee ID',
  })
  @IsOptional()
  @IsString()
  searchKey?: string;

  @ApiPropertyOptional({ type: String, description: 'Filter by leave policy' })
  @IsOptional()
  @IsString()
  leavePolicyId?: string;

  @ApiPropertyOptional({ enum: LeaveRequestStatus })
  @IsOptional()
  @IsEnum(LeaveRequestStatus)
  status?: LeaveRequestStatus;

  @ApiPropertyOptional({
    type: String,
    example: '2026-11',
    description: 'Filter by month (YYYY-MM)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'Month must use format YYYY-MM.',
  })
  month?: string;
}
