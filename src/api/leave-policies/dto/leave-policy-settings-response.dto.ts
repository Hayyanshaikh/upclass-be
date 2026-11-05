import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LeavePolicySettingDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  approvalRequired: boolean;

  @ApiProperty()
  carryForward: boolean;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}

export class LeavePolicySettingResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: LeavePolicySettingDto })
  data: LeavePolicySettingDto;

  @ApiPropertyOptional()
  warning?: string;
}
