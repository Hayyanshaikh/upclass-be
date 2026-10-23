import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleType } from '../../../generated/prisma/client.ts';

export class RoleDataDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ example: 'super_admin' })
  slug!: string;

  @ApiProperty({ type: String, nullable: true })
  description!: string | null;

  @ApiProperty({ enum: RoleType })
  type!: RoleType;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class RoleDetailDataDto extends RoleDataDto {
  @ApiProperty({ type: [String], example: ['students.view', 'roles.edit'] })
  permissionKeys!: string[];
}

export class RoleResponseDto {
  @ApiProperty({ type: RoleDetailDataDto })
  data!: RoleDetailDataDto;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  statusCode!: number;

  @ApiPropertyOptional()
  warning?: string;
}

export class RoleListItemDto extends RoleDataDto {
  @ApiProperty()
  users!: number;
}

export class RolesResponseDto {
  @ApiProperty({ type: [RoleListItemDto] })
  data!: RoleListItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  statusCode!: number;

  @ApiPropertyOptional()
  warning?: string;
}
