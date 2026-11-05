import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAcademicTermDto {
  @ApiProperty({ example: 'First Term' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
