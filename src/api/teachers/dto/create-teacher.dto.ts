import { ApiProperty } from '@nestjs/swagger';

export class CreateTeacherDto {
  @ApiProperty()
  name: string;
}
