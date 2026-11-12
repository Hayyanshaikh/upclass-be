import { ApiProperty } from '@nestjs/swagger';

export class TimetableClassSectionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  classId: string;

  @ApiProperty()
  sectionId: string;

  @ApiProperty()
  name: string;
}

export class TimetableClassSectionsResponseDto {
  @ApiProperty({ type: [TimetableClassSectionDto] })
  data: TimetableClassSectionDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;
}
