import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  IsBoolean,
} from 'class-validator';

import { Gendar, Role } from '../../../generated/prisma/enums';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  age?: number;

  @ApiPropertyOptional({ enum: Gendar })
  @IsOptional()
  @IsEnum(Gendar)
  gender?: Gendar;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
