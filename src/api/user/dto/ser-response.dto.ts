import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gendar, Role } from '../../../generated/prisma/enums';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional({ nullable: true })
  age: number | null;

  @ApiProperty({ enum: Gendar })
  gender: Gendar;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
