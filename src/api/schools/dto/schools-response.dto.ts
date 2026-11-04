import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SchoolDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: String, nullable: true })
  email: string | null;

  @ApiProperty({ type: String, nullable: true })
  phone: string | null;

  @ApiProperty({ type: String, nullable: true })
  address: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: Number })
  usersCount?: number;

  @ApiProperty({ type: String, nullable: true })
  logo: string | null;

  @ApiProperty({ type: String, nullable: true })
  shortCode: string | null;

  @ApiProperty({ nullable: true })
  schoolType: string | null;

  @ApiProperty({ nullable: true })
  educationSystem: string | null;

  @ApiProperty({ type: Number, nullable: true })
  establishedYear: number | null;

  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @ApiProperty({ type: String, nullable: true })
  principalName: string | null;

  @ApiProperty({ type: String, nullable: true })
  vicePrincipalName: string | null;

  @ApiProperty({ type: String, nullable: true })
  adminContact: string | null;

  @ApiProperty({ type: String, nullable: true })
  ownerName: string | null;

  @ApiProperty({ type: String, nullable: true })
  dateFormat: string | null;

  @ApiProperty({ type: Number, nullable: true })
  feeDueDate: number | null;

  @ApiProperty({ type: [String] })
  workingDays: string[];

  @ApiProperty({ type: String, nullable: true })
  openingTime: string | null;

  @ApiProperty({ type: String, nullable: true })
  closingTime: string | null;
}

export class SchoolsResponseDto {
  @ApiProperty({ type: [SchoolDto] })
  data: SchoolDto[];

  @ApiProperty({ description: 'Total schools matching the filters' })
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiPropertyOptional()
  warning?: string;
}

export class SchoolFindOneResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: SchoolDto })
  data: SchoolDto;

  @ApiPropertyOptional()
  warning?: string;
}
