import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address or phone number',
  })
  @IsString()
  @IsNotEmpty({ message: 'Email or phone number is required.' })
  identifier: string;

  @ApiProperty({ example: 'MyPassword123' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;
}
