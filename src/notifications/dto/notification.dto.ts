import { IsString, IsOptional, IsEnum, IsArray, IsMongoId } from 'class-validator';

export class CreateNotificationDto {
  @IsMongoId()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  data?: Record<string, any>;

  @IsOptional()
  @IsString()
  icon?: string;
}

export class BroadcastNotificationDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  data?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  userIds?: string[];
}
