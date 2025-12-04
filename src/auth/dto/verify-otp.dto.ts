import { IsEmail, Length } from "class-validator";

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @Length(6)
  otp: string;
}
