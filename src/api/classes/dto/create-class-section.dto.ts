import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateClassSectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sectionId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  teacherId!: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'Room 12' })
  @IsOptional()
  @IsString()
  @Matches(/\S/, { message: 'Enter classroom.' })
  room?: string | null;

  @ApiPropertyOptional({ type: Number, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Enter a positive whole number.' })
  @Min(1, { message: 'Enter a positive whole number.' })
  capacity?: number | null;
}
