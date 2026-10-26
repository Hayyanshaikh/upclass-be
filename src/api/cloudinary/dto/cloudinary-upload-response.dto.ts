import { ApiProperty } from '@nestjs/swagger';

export class CloudinaryUploadDataDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  publicId: string;
}

export class CloudinaryUploadResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: CloudinaryUploadDataDto })
  data: CloudinaryUploadDataDto;
}
