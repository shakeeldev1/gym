import { IsNotEmpty, IsOptional, IsString, IsEnum, IsArray, IsBoolean, IsNumber } from 'class-validator';
import { CommunityType } from '../schemas/community.schema';

export class CreateCommunityDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsEnum(CommunityType)
  type?: CommunityType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  members?: string[]; // Initial member IDs

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  admins?: string[]; // Additional admin IDs

  @IsOptional()
  settings?: {
    allowMembersToPost?: boolean;
    allowMembersToAddOthers?: boolean;
    maxMembers?: number;
  };
}

export class UpdateCommunityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsEnum(CommunityType)
  type?: CommunityType;

  @IsOptional()
  settings?: {
    allowMembersToPost?: boolean;
    allowMembersToAddOthers?: boolean;
    maxMembers?: number;
  };
}

export class AddMembersDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}

export class RemoveMemberDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class PromoteAdminDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}
