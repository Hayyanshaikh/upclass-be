import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CreateLeaveRequestAttachmentDto {
  @ApiProperty({ example: 'medical-certificate.pdf' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/.../certificate.pdf' })
  @IsString()
  @IsNotEmpty()
  url!: string;
}

export class CreateLeaveRequestDto {
  @ApiProperty({ description: 'Leave policy ID for the requested leave type' })
  @IsString()
  @IsNotEmpty()
  leavePolicyId!: string;

  @ApiProperty({ example: '2026-11-20' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'From date must use format YYYY-MM-DD.',
  })
  fromDate!: string;

  @ApiProperty({ example: '2026-11-21' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'To date must use format YYYY-MM-DD.',
  })
  toDate!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isHalfDay?: boolean;

  @ApiProperty({ example: 'Family commitment' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason!: string;

  @ApiPropertyOptional({ example: '0300-0000000' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  contactDuringLeave?: string;

  @ApiPropertyOptional({ description: 'Teacher ID proposed as substitute' })
  @IsOptional()
  @IsString()
  substituteTeacherId?: string;

  @ApiPropertyOptional({ type: [CreateLeaveRequestAttachmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLeaveRequestAttachmentDto)
  attachments?: CreateLeaveRequestAttachmentDto[];
}
