import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

import { Gendar, Role } from '../../../generated/prisma/enums';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  password: string;

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
