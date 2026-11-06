import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LookupItemDto {
  @ApiProperty({ description: 'Record ID' })
  id: string;

  @ApiProperty({ description: 'Record name' })
  name: string;

  @ApiPropertyOptional({ description: 'Record code' })
  code?: string;

  @ApiPropertyOptional({ description: 'Record status' })
  status?: string;
}

export class LookupResponseDto {
  @ApiProperty({ type: [LookupItemDto] })
  data: LookupItemDto[];

  @ApiProperty({ description: 'Total records' })
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;
}
