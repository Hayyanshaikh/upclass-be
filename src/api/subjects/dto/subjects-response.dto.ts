import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  SubjectStatus,
  SubjectType,
} from '../../../generated/prisma/client.ts';

export class SubjectDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ enum: SubjectType })
  type: SubjectType;

  @ApiProperty({ enum: SubjectStatus })
  status: SubjectStatus;

  @ApiProperty()
  hasPractical: boolean;

  @ApiProperty()
  defaultTotalMarks: number;

  @ApiProperty()
  defaultPassingMarks: number;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}

export class SubjectsResponseDto {
  @ApiProperty({ type: [SubjectDto] })
  data: SubjectDto[];

  @ApiProperty({ description: 'Total subjects matching the filters' })
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiPropertyOptional()
  warning?: string;
}

export class SubjectFindOneResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: SubjectDto })
  data: SubjectDto;

  @ApiPropertyOptional()
  warning?: string;
}
