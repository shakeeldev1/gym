import { IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RequestResetDto {
    @ApiProperty({
        description: 'Email address for password reset',
        example: 'john.doe@example.com',
        required: true
    })
    @IsEmail()
    email: string;
}