import { IsNotEmpty, IsOptional, IsEnum, IsString, IsArray, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '../schemas/message.schema';

export class SendMessageDto {
  @ApiPropertyOptional({
    description: 'Recipient user ID for one-on-one chat',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  recipient?: string; // User ID for one-on-one chat

  @ApiPropertyOptional({
    description: 'Community ID for community chat',
    example: '507f1f77bcf86cd799439012',
  })
  @IsOptional()
  @IsString()
  community?: string; // Community ID for community chat

  @ApiPropertyOptional({
    description: 'Conversation ID (optional, can be auto-created)',
    example: '507f1f77bcf86cd799439013',
  })
  @IsOptional()
  @IsString()
  conversation?: string; // Conversation ID (optional, can be auto-created)

  @ApiProperty({
    description: 'Message type',
    enum: MessageType,
    example: 'TEXT',
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(MessageType)
  type: MessageType;

  @ApiPropertyOptional({
    description: 'Text content (required for text messages)',
    example: 'Hello team!',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Media URL for audio/image/video',
    example: 'https://cdn.example.com/media/voice-note.mp3',
  })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({
    description: 'Media duration in seconds',
    example: 12,
  })
  @IsOptional()
  @IsNumber()
  mediaDuration?: number;

  @ApiPropertyOptional({
    description: 'Media size in bytes',
    example: 204800,
  })
  @IsOptional()
  @IsNumber()
  mediaSize?: number;

  @ApiPropertyOptional({
    description: 'Media MIME type',
    example: 'audio/mpeg',
  })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({
    description: 'Message ID being replied to',
    example: '507f1f77bcf86cd799439014',
  })
  @IsOptional()
  @IsString()
  replyTo?: string; // Message ID being replied to

  @ApiPropertyOptional({
    description: 'Whether this is a broadcast message',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isBroadcast?: boolean;

  @ApiPropertyOptional({
    description: 'Recipient user IDs for broadcast',
    example: ['507f1f77bcf86cd799439015'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  broadcastRecipients?: string[]; // Array of user IDs for broadcast
}
