import { ApiProperty } from '@nestjs/swagger';

export class PermissionDataDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'students.view' })
  key!: string;

  @ApiProperty({ type: String, nullable: true })
  description!: string | null;

  @ApiProperty({ example: 'People' })
  group!: string;

  @ApiProperty({ example: 'Students' })
  module!: string;

  @ApiProperty({ example: 'View' })
  action!: string;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty()
  createdAt!: Date;
}

export class PermissionResponseDto {
  @ApiProperty({ type: PermissionDataDto })
  data!: PermissionDataDto;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  statusCode!: number;
}

export class PermissionsResponseDto {
  @ApiProperty({ type: [PermissionDataDto] })
  data!: PermissionDataDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  statusCode!: number;
}
