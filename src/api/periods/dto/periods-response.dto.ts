import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PeriodStatus, PeriodType } from '../../../generated/prisma/client.ts';

export class PeriodDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty({ enum: PeriodType })
  type: PeriodType;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty({ enum: PeriodStatus })
  status: PeriodStatus;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}

export class PeriodsResponseDto {
  @ApiProperty({ type: [PeriodDto] })
  data: PeriodDto[];

  @ApiProperty({ description: 'Total periods matching the filters' })
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiPropertyOptional()
  warning?: string;
}

export class PeriodFindOneResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: PeriodDto })
  data: PeriodDto;
}
