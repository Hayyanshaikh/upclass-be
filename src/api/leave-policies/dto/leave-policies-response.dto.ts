import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LeavePolicyDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  daysPerYear: number;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}

export class LeavePoliciesResponseDto {
  @ApiProperty({ type: [LeavePolicyDto] })
  data: LeavePolicyDto[];

  @ApiProperty({ description: 'Total leave policies for the school' })
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiPropertyOptional()
  warning?: string;
}

export class LeavePolicyFindOneResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: LeavePolicyDto })
  data: LeavePolicyDto;

  @ApiPropertyOptional()
  warning?: string;
}
