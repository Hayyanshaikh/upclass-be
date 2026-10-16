import { ApiProperty } from '@nestjs/swagger';
import { Gendar, Role } from '../../../generated/prisma/enums';

export class LoginResponseUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ enum: Gendar })
  gender: Gendar;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: LoginResponseUserDto })
  user: LoginResponseUserDto;
}
