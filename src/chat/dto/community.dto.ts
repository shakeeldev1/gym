import { IsNotEmpty, IsOptional, IsString, IsEnum, IsArray, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommunityType } from '../schemas/community.schema';

export class CreateCommunityDto {
  @ApiProperty({
    description: 'Community name',
    example: 'Thrive Runners',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Community description',
    example: 'A place for runners to share progress',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Community image URL',
    example: 'https://cdn.example.com/communities/runners.png',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Community type',
    enum: CommunityType,
    example: 'PUBLIC',
  })
  @IsOptional()
  @IsEnum(CommunityType)
  type?: CommunityType;

  @ApiPropertyOptional({
    description: 'Initial member IDs',
    example: ['507f1f77bcf86cd799439011'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  members?: string[]; // Initial member IDs

  @ApiPropertyOptional({
    description: 'Initial admin IDs',
    example: ['507f1f77bcf86cd799439012'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  admins?: string[]; // Additional admin IDs

  @ApiPropertyOptional({
    description: 'Community settings',
    example: { allowMembersToPost: true, allowMembersToAddOthers: false, maxMembers: 200 },
  })
  @IsOptional()
  settings?: {
    allowMembersToPost?: boolean;
    allowMembersToAddOthers?: boolean;
    maxMembers?: number;
  };
}

export class UpdateCommunityDto {
  @ApiPropertyOptional({
    description: 'Community name',
    example: 'Thrive Runners',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Community description',
    example: 'A place for runners to share progress',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Community image URL',
    example: 'https://cdn.example.com/communities/runners.png',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Community type',
    enum: CommunityType,
    example: 'PUBLIC',
  })
  @IsOptional()
  @IsEnum(CommunityType)
  type?: CommunityType;

  @ApiPropertyOptional({
    description: 'Community settings',
    example: { allowMembersToPost: true, allowMembersToAddOthers: false, maxMembers: 200 },
  })
  @IsOptional()
  settings?: {
    allowMembersToPost?: boolean;
    allowMembersToAddOthers?: boolean;
    maxMembers?: number;
  };
}

export class AddMembersDto {
  @ApiProperty({
    description: 'User IDs to add',
    example: ['507f1f77bcf86cd799439011'],
    type: [String],
    required: true,
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}

export class RemoveMemberDto {
  @ApiProperty({
    description: 'User ID to remove',
    example: '507f1f77bcf86cd799439012',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class PromoteAdminDto {
  @ApiProperty({
    description: 'User ID to promote to admin',
    example: '507f1f77bcf86cd799439013',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
}
