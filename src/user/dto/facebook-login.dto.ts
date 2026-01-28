import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FacebookLoginDto {
  @ApiProperty({
    description: 'Facebook OAuth access token',
    example: 'EAABwzLixnjYBO...',
    required: true
  })
  @IsString()
  accessToken: string;
}
