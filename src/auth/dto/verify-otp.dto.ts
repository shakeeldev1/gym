import { IsEmail, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class VerifyOtpDto {
  @ApiProperty({
    description: 'User email address to verify',
    example: 'john.doe@example.com',
    required: true
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '6-digit OTP code sent to email',
    example: '123456',
    required: true,
    minLength: 6,
    maxLength: 6
  })
  @Length(6)
  otp: string;
}
