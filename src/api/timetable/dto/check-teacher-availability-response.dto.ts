import { ApiProperty } from '@nestjs/swagger';

export class CheckTeacherAvailabilityResultDto {
  @ApiProperty()
  conflict: boolean;

  @ApiProperty()
  message: string;
}

export class CheckTeacherAvailabilityResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: CheckTeacherAvailabilityResultDto })
  data: CheckTeacherAvailabilityResultDto;
}
