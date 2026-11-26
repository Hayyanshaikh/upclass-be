import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveLeaveRequestDto {
  @ApiPropertyOptional({ example: 'Approved, substitute already informed.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}

export class RejectLeaveRequestDto {
  @ApiProperty({ example: 'Exam week, leave cannot be granted.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason!: string;
}
