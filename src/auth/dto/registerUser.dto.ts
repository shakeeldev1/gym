import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    fName: string;

    @IsNotEmpty()
    @IsString()
    lName: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    otp: string;
    otpExpire: Date;
    isVerified: boolean;
}

export class LoginDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}