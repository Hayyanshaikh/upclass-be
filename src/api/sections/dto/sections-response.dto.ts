import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SectionStatus } from '../../../generated/prisma/client.ts';

export class SectionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: SectionStatus })
  status: SectionStatus;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}

export class SectionsResponseDto {
  @ApiProperty({ type: [SectionDto] })
  data: SectionDto[];

  @ApiProperty({ description: 'Total sections matching the filters' })
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiPropertyOptional()
  warning?: string;
}

export class SectionFindOneResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: SectionDto })
  data: SectionDto;

  @ApiPropertyOptional()
  warning?: string;
}
