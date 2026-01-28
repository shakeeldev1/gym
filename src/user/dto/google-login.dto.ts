// auth/dto/google-login.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'Google OAuth ID token',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE4MmU0M...',
    required: true
  })
  @IsString()
  idToken: string;
}
