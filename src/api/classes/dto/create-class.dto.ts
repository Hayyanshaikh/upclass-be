import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ClassStatus } from '../../../generated/prisma/client.ts';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateClassDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'A' })
  @IsString()
  @Matches(/^\s*[A-Za-z]+\s*$/, { message: 'Enter a section, e.g. A.' })
  section!: string;

  @ApiProperty({ example: 'Room 12' })
  @IsString()
  @Matches(/\S/, { message: 'Enter room.' })
  room!: string;

  @ApiProperty({ type: Number, minimum: 1 })
  @Type(() => Number)
  @IsInt({ message: 'Enter a positive whole number.' })
  @Min(1, { message: 'Enter a positive whole number.' })
  capacity!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  academicYearId!: string;

  @ApiProperty({ enum: ClassStatus, default: ClassStatus.ACTIVE })
  @IsEnum(ClassStatus)
  status!: ClassStatus;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  teacherId!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  assistantTeacherId?: string | null;
}
