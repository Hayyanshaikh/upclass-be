import { ApiProperty } from '@nestjs/swagger';

export class CheckTeacherAvailabilityResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  conflict: boolean;

  @ApiProperty()
  message: string;
}
