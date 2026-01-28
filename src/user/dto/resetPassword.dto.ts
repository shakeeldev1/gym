import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
    @ApiProperty({
        description: 'User email address',
        example: 'john.doe@example.com',
        required: true
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: '6-digit reset OTP code sent to email',
        example: '123456',
        required: true
    })
    @IsString()
    resetOtp: string;

    @ApiProperty({
        description: 'New password (minimum 6 characters)',
        example: 'NewSecurePass123',
        required: true,
        minLength: 6
    })
    @IsString()
    newPassword: string;
}