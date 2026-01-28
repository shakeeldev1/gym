import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordDto {
    @ApiProperty({
        description: 'Current password',
        example: 'OldPass123',
        required: true
    })
    @IsString()
    oldPassword: string;

    @ApiProperty({
        description: 'New password (minimum 6 characters)',
        example: 'NewSecurePass123',
        required: true,
        minLength: 6
    })
    @IsString()
    newPassword: string;
}