import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gendar } from '../../../generated/prisma/enums.ts';
import { PermissionDataDto } from '../../permissions/dto/permission-response.dto.ts';

export class PermissionKey {
  @ApiProperty()
  key: string;
}
export class RoleSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ example: 'super_admin' })
  slug: string;

  @ApiPropertyOptional({ type: () => [PermissionKey] })
  permissions?: PermissionKey[];
}
export class LoginResponseUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  roleId?: string;

  @ApiPropertyOptional({ type: () => RoleSummaryDto })
  role?: RoleSummaryDto;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isSystem: boolean;

  @ApiProperty({ enum: Gendar })
  gender: Gendar;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: LoginResponseUserDto })
  user: LoginResponseUserDto;
}

export class UserResponseDto {
  @ApiProperty({ type: [LoginResponseUserDto] })
  data: LoginResponseUserDto[];

  @ApiProperty({ description: 'Total users matching the filters' })
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiPropertyOptional()
  warning?: string;
}

export class UserFindOneResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: LoginResponseUserDto })
  data: LoginResponseUserDto;

  @ApiPropertyOptional()
  warning?: string;
}
