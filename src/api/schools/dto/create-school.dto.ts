import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateSchoolDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'school@example.com' })
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required.' })
  email!: string;

  @ApiProperty({ example: '0300-1234567' })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required.' })
  @Matches(/^\+?[\d\s\-()]{7,20}$/, {
    message: 'Phone number must be a valid format.',
  })
  phone!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiPropertyOptional({ type: Boolean, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean | null;

  // School Admin Details

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  adminPassword!: string;
}
