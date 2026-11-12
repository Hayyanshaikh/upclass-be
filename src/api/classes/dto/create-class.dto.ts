import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ClassStatus } from '../../../generated/prisma/client.ts';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateClassSectionDto } from './create-class-section.dto.ts';

export class CreateClassDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  academicYearId!: string;

  @ApiProperty({ enum: ClassStatus, default: ClassStatus.ACTIVE })
  @IsEnum(ClassStatus)
  status!: ClassStatus;

  @ApiProperty({ type: [CreateClassSectionDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Add at least one section.' })
  @ValidateNested({ each: true })
  @Type(() => CreateClassSectionDto)
  sections!: CreateClassSectionDto[];
}
