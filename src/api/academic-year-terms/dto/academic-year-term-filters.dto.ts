import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AcademicYearTermFiltersDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Filter assigned terms by academic year ID',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  academicYearId?: string;
}
