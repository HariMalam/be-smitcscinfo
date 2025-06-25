import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OtpType } from '../../../../common/enums/otp-type.emum';

export class SendOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address to which the OTP will be sent.',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: OtpType.VERIFY_EMAIL,
    enum: OtpType,
    description: 'The type of OTP operation.',
    default: OtpType.VERIFY_EMAIL,
  })
  @IsEnum(OtpType)
  type: OtpType = OtpType.VERIFY_EMAIL;
}
