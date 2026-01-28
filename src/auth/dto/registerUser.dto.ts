import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
    @ApiProperty({
        description: 'User first name',
        example: 'John',
        required: true
    })
    @IsNotEmpty()
    @IsString()
    fName: string;

    @ApiProperty({
        description: 'User last name',
        example: 'Doe',
        required: true
    })
    @IsNotEmpty()
    @IsString()
    lName: string;

    @ApiProperty({
        description: 'User email address',
        example: 'john.doe@example.com',
        required: true
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User password (minimum 6 characters)',
        example: 'SecurePass123',
        required: true,
        minLength: 6
    })
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiProperty({
        description: 'OTP for verification (internal use)',
        required: false
    })
    otp: string;
    
    @ApiProperty({
        description: 'OTP expiration time (internal use)',
        required: false
    })
    otpExpire: Date;
    
    @ApiProperty({
        description: 'Email verification status (internal use)',
        required: false
    })
    isVerified: boolean;
}
