import { IsOptional, IsNumber, IsString } from 'class-validator';

export class GetMessagesDto {
  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsString()
  communityId?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  skip?: number;

  @IsOptional()
  @IsString()
  before?: string; // Message ID - get messages before this

  @IsOptional()
  @IsString()
  after?: string; // Message ID - get messages after this
}

export class MarkAsReadDto {
  @IsOptional()
  @IsString()
  messageId?: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsString()
  communityId?: string;
}
