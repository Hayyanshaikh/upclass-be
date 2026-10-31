import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  SubjectStatus,
  SubjectType,
} from '../../../generated/prisma/client.ts';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ enum: SubjectType })
  @IsEnum(SubjectType)
  type!: SubjectType;

  @ApiPropertyOptional({ enum: SubjectStatus, default: SubjectStatus.ACTIVE })
  @IsOptional()
  @IsEnum(SubjectStatus)
  status?: SubjectStatus;

  @ApiPropertyOptional({ type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  hasPractical?: boolean;

  @ApiPropertyOptional({
    type: Number,
    default: 100,
    description: 'Default total marks for the subject',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultTotalMarks?: number;

  @ApiPropertyOptional({
    type: Number,
    default: 33,
    description: 'Default passing marks for the subject',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultPassingMarks?: number;
}
