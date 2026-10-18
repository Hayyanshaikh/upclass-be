import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleDataDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ example: 'super_admin' })
  slug!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class RoleResponseDto {
  @ApiProperty({ type: RoleDataDto })
  data!: RoleDataDto;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  statusCode!: number;

  @ApiPropertyOptional()
  warning?: string;
}

export class RolesResponseDto {
  @ApiProperty({ type: [RoleDataDto] })
  data!: RoleDataDto[];

  @ApiProperty()
  message!: string;

  @ApiProperty()
  statusCode!: number;

  @ApiPropertyOptional()
  warning?: string;
}
