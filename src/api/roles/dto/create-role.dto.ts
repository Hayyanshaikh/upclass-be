import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Super Admin', maxLength: 80 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @ApiProperty({ example: 'super_admin', maxLength: 80 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:_[a-z0-9]+)*$/, {
    message: 'Slug must use lowercase letters, numbers, and underscores.',
  })
  slug!: string;

  @ApiPropertyOptional({ example: 'Can manage classroom activities.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
