import { IsEmail, IsString } from "class-validator";

export class ResetPasswordDto {
    @IsEmail()
    email: string;

    @IsString()
    resetOtp: string;

    @IsString()
    newPassword: string;
}