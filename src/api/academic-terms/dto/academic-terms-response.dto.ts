import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AcademicTermDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}

export class AcademicTermsResponseDto {
  @ApiProperty({ type: [AcademicTermDto] })
  data: AcademicTermDto[];

  @ApiProperty({ description: 'Total academic terms for the school' })
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiPropertyOptional()
  warning?: string;
}

export class AcademicTermFindOneResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: AcademicTermDto })
  data: AcademicTermDto;

  @ApiPropertyOptional()
  warning?: string;
}
