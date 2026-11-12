import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SectionStatus } from '../../../generated/prisma/client.ts';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ enum: SectionStatus, default: SectionStatus.ACTIVE })
  @IsOptional()
  @IsEnum(SectionStatus)
  status?: SectionStatus;
}
