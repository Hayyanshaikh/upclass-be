import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SectionStatus } from '../../../generated/prisma/client.ts';

export class FindSectionsQueryDto {
  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    description: 'Maximum number of sections to return',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @Type(() => String)
  @IsString()
  searchKey?: string;

  @ApiPropertyOptional({
    type: Number,
    minimum: 0,
    default: 0,
    description: 'Number of sections to skip',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ enum: SectionStatus })
  @IsOptional()
  @IsEnum(SectionStatus)
  status?: SectionStatus;
}
