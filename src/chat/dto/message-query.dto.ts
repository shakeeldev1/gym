import { IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetMessagesDto {
  @ApiPropertyOptional({
    description: 'Conversation ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  conversationId?: string;

  @ApiPropertyOptional({
    description: 'Community ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsOptional()
  @IsString()
  communityId?: string;

  @ApiPropertyOptional({
    description: 'Page size limit',
    example: 20,
  })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Records to skip',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  skip?: number;

  @ApiPropertyOptional({
    description: 'Get messages before this message ID',
    example: '507f1f77bcf86cd799439013',
  })
  @IsOptional()
  @IsString()
  before?: string; // Message ID - get messages before this

  @ApiPropertyOptional({
    description: 'Get messages after this message ID',
    example: '507f1f77bcf86cd799439014',
  })
  @IsOptional()
  @IsString()
  after?: string; // Message ID - get messages after this
}

export class MarkAsReadDto {
  @ApiPropertyOptional({
    description: 'Message ID to mark as read',
    example: '507f1f77bcf86cd799439015',
  })
  @IsOptional()
  @IsString()
  messageId?: string;

  @ApiPropertyOptional({
    description: 'Conversation ID to mark as read',
    example: '507f1f77bcf86cd799439016',
  })
  @IsOptional()
  @IsString()
  conversationId?: string;

  @ApiPropertyOptional({
    description: 'Community ID to mark as read',
    example: '507f1f77bcf86cd799439017',
  })
  @IsOptional()
  @IsString()
  communityId?: string;
}
