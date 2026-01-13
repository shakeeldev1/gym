import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '../auth/auth.guard';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateCommunityDto, UpdateCommunityDto, AddMembersDto } from './dto/community.dto';
import { GetMessagesDto, MarkAsReadDto } from './dto/message-query.dto';

@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  // ==================== MESSAGE ENDPOINTS ====================

  @Post('messages')
  async sendMessage(@Request() req, @Body() dto: SendMessageDto) {
    const message = await this.chatService.sendMessage(req.user.id, dto);
    
    // Emit to socket for real-time delivery
    if (message) {
      this.chatGateway.emitMessage(message);
    }
    
    return message;
  }

  @UseGuards(AuthGuard)
  @Get('messages')
  async getMessages(@Query() query: GetMessagesDto, @Request() req) {
    const userId = req.user.id;
    console.log('📨 Getting messages for user:', userId, 'query:', query);
    const messages = await this.chatService.getMessages(query);
    console.log('📊 Retrieved', messages.length, 'messages');
    return messages;
  }

  @UseGuards(AuthGuard)
  @Get('messages/:id')
  async getMessage(@Param('id') id: string, @Request() req) {
    return this.chatService.getMessage(id);
  }

  @Post('messages/read')
  async markAsRead(@Request() req, @Body() dto: MarkAsReadDto) {
    const updatedCount = await this.chatService.markAsRead(req.user.id, dto);
    
    // Emit socket event for each message that was marked as read
    if (updatedCount > 0) {
      // Get all the messages that were just marked as read
      const messages = await this.chatService.getMessages(dto);
      
      const currentUserId = String(req.user.id);
      messages.forEach(msg => {
        // Extract sender ID if it's an object
        const senderId = typeof msg.sender === 'object' 
          ? String(msg.sender?._id || msg.sender?.id)
          : String(msg.sender);
        
        // Only notify the sender if it's not the current user
        if (senderId && senderId !== currentUserId) {
          this.chatGateway.server.to(`user:${senderId}`).emit('message:read', {
            messageId: msg._id,
            conversationId: dto.conversationId,
            readBy: req.user.id,
            readAt: new Date(),
          });
        }
      });
    }
    
    return { message: 'Marked as read', updatedCount };
  }

  @Delete('messages/:id')
  async deleteMessage(@Request() req, @Param('id') id: string) {
    return this.chatService.deleteMessage(req.user.id, id);
  }

  @Post('broadcast')
  async sendBroadcast(@Request() req, @Body() dto: SendMessageDto) {
    const message = await this.chatService.sendBroadcast(req.user.id, dto);
    
    // Emit to socket for real-time delivery
    if (message) {
      this.chatGateway.emitMessage(message);
    }
    
    return message;
  }

  // ==================== CONVERSATION ENDPOINTS ====================

  @UseGuards(AuthGuard)
  @Get('conversations/:id')
  async getConversation(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    console.log('📋 Getting conversation:', id, 'for user:', userId);
    return this.chatService.getConversation(id);
  }

  // ==================== FILE UPLOAD ENDPOINTS ====================

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/chat',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
      },
      fileFilter: (req, file, callback) => {
        // Allow images, audio, and documents
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'audio/mpeg',
          'audio/wav',
          'audio/ogg',
          'audio/webm',
          'audio/aac',
          'audio/mp4',
          'audio/flac',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException(`Invalid file type: ${file.mimetype}`), false);
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Always return absolute URL for file serving
    const fileUrl = `http://localhost:3000/uploads/chat/${file.filename}`;

    return {
      url: fileUrl,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  // ==================== CONVERSATION ENDPOINTS ====================

  @Get('conversations')
  async getUserConversations(@Request() req) {
    return this.chatService.getUserConversations(req.user.id);
  }

  @Post('conversations/:id/archive')
  async archiveConversation(@Request() req, @Param('id') id: string) {
    return this.chatService.archiveConversation(req.user.id, id);
  }

  @Post('conversations/:id/mute')
  async muteConversation(
    @Request() req,
    @Param('id') id: string,
    @Body('muted') muted: boolean,
  ) {
    return this.chatService.muteConversation(req.user.id, id, muted);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    return this.chatService.getUnreadCount(req.user.id);
  }

  // ==================== COMMUNITY ENDPOINTS ====================

  @Post('communities')
  async createCommunity(@Request() req, @Body() dto: CreateCommunityDto) {
    return this.chatService.createCommunity(req.user.id, dto);
  }

  @Get('communities')
  async getUserCommunities(@Request() req) {
    return this.chatService.getUserCommunities(req.user.id);
  }

  @Get('communities/:id')
  async getCommunity(@Param('id') id: string) {
    return this.chatService.getCommunity(id);
  }

  @Put('communities/:id')
  async updateCommunity(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateCommunityDto,
  ) {
    return this.chatService.updateCommunity(req.user.id, id, dto);
  }

  @Delete('communities/:id')
  async deleteCommunity(@Request() req, @Param('id') id: string) {
    return this.chatService.deleteCommunity(req.user.id, id);
  }

  @Post('communities/:id/members')
  async addMembers(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: AddMembersDto,
  ) {
    return this.chatService.addMembers(req.user.id, id, dto);
  }

  @Delete('communities/:id/members/:userId')
  async removeMember(
    @Request() req,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.chatService.removeMember(req.user.id, id, userId);
  }

  @Post('communities/:id/admins/:userId')
  async promoteToAdmin(
    @Request() req,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.chatService.promoteToAdmin(req.user.id, id, userId);
  }

  @Post('communities/:id/leave')
  async leaveCommunity(@Request() req, @Param('id') id: string) {
    return this.chatService.leaveCommunity(req.user.id, id);
  }

  @Get('communities/:id/unread-count')
  async getCommunityUnreadCount(@Request() req, @Param('id') id: string) {
    return this.chatService.getCommunityUnreadCount(req.user.id, id);
  }

  // ==================== OFFLINE MESSAGE QUEUE ====================

  @Get('queued-messages')
  async getQueuedMessages(@Request() req) {
    return this.chatService.getQueuedMessages(req.user.id);
  }

  @Get('queue-status')
  async getQueueStatus(@Request() req) {
    return this.chatService.getQueueStatus(req.user.id);
  }
}
