import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address to which the OTP will be sent.',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
