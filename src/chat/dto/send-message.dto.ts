import { IsNotEmpty, IsOptional, IsEnum, IsString, IsArray, IsBoolean, IsNumber } from 'class-validator';
import { MessageType } from '../schemas/message.schema';

export class SendMessageDto {
  @IsOptional()
  @IsString()
  recipient?: string; // User ID for one-on-one chat

  @IsOptional()
  @IsString()
  community?: string; // Community ID for community chat

  @IsOptional()
  @IsString()
  conversation?: string; // Conversation ID (optional, can be auto-created)

  @IsNotEmpty()
  @IsEnum(MessageType)
  type: MessageType;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsNumber()
  mediaDuration?: number;

  @IsOptional()
  @IsNumber()
  mediaSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsString()
  replyTo?: string; // Message ID being replied to

  @IsOptional()
  @IsBoolean()
  isBroadcast?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  broadcastRecipients?: string[]; // Array of user IDs for broadcast
}
