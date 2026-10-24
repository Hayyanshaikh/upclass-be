import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionDataDto } from '../../permissions/dto/permission-response.dto.ts';

export class TeacherDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class TeacherResponseDto {
  @ApiProperty({ type: [TeacherDto] })
  data: TeacherDto[];

  @ApiProperty({ description: 'Total teachers matching the filters' })
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiPropertyOptional()
  warning?: string;
}

export class TeacherFindOneResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: TeacherDto })
  data: TeacherDto;

  @ApiPropertyOptional()
  warning?: string;
}
