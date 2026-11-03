import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SchoolDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: String, nullable: true })
  email: string | null;

  @ApiProperty({ type: String, nullable: true })
  phone: string | null;

  @ApiProperty({ type: String, nullable: true })
  address: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: Number })
  usersCount?: number;
}

export class SchoolsResponseDto {
  @ApiProperty({ type: [SchoolDto] })
  data: SchoolDto[];

  @ApiProperty({ description: 'Total schools matching the filters' })
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiPropertyOptional()
  warning?: string;
}

export class SchoolFindOneResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: SchoolDto })
  data: SchoolDto;

  @ApiPropertyOptional()
  warning?: string;
}