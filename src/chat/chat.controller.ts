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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ApiAdminOnly } from 'src/common/decorators/api-admin.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CloudinaryService } from '../common/cloudinary.service';
import { SendMessageDto } from './dto/send-message.dto';
import {
  CreateCommunityDto,
  UpdateCommunityDto,
  AddMembersDto,
} from './dto/community.dto';
import { GetMessagesDto, MarkAsReadDto } from './dto/message-query.dto';

@ApiTags('Chat')
@ApiBearerAuth('JWT-auth')
@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ==================== MESSAGE ENDPOINTS ====================

  @Post('messages')
  @ApiOperation({
    summary: 'Send a message',
    description: 'Send a new message to a user or group.',
  })
  @ApiResponse({ status: 201, description: 'Message sent successfully.' })
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
  @ApiOperation({
    summary: 'Get messages',
    description: 'Retrieve messages based on query filters.',
  })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully.' })
  async getMessages(@Query() query: GetMessagesDto, @Request() req) {
    const userId = req.user.id;
    console.log('📨 Getting messages for user:', userId, 'query:', query);
    const messages = await this.chatService.getMessages(query);
    console.log('📊 Retrieved', messages.length, 'messages');
    return messages;
  }

  @UseGuards(AuthGuard)
  @Get('messages/:id')
  @ApiOperation({
    summary: 'Get a message',
    description: 'Retrieve a specific message by ID.',
  })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message retrieved successfully.' })
  async getMessage(@Param('id') id: string, @Request() req) {
    return this.chatService.getMessage(id);
  }

  @Post('messages/read')
  @ApiOperation({
    summary: 'Mark messages as read',
    description: 'Mark messages in a conversation as read.',
  })
  @ApiResponse({ status: 200, description: 'Messages marked as read.' })
  async markAsRead(@Request() req, @Body() dto: MarkAsReadDto) {
    const updatedCount = await this.chatService.markAsRead(req.user.id, dto);

    // Emit socket event for each message that was marked as read
    if (updatedCount > 0) {
      // Get all the messages that were just marked as read
      const messages = await this.chatService.getMessages(dto);

      const currentUserId = String(req.user.id);
      messages.forEach((msg) => {
        // Extract sender ID if it's an object
        const senderId =
          typeof msg.sender === 'object'
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
  @ApiOperation({
    summary: 'Delete a message',
    description: 'Delete a message by ID.',
  })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully.' })
  async deleteMessage(@Request() req, @Param('id') id: string) {
    return this.chatService.deleteMessage(req.user.id, id);
  }

  @Post('broadcast')
  @ApiOperation({
    summary: 'Send a broadcast',
    description: 'Send a message to multiple users.',
  })
  @ApiResponse({ status: 201, description: 'Broadcast sent successfully.' })
  async sendBroadcast(@Request() req, @Body() dto: SendMessageDto) {
    const message = await this.chatService.sendBroadcast(req.user.id, dto);

    // Emit to socket for real-time delivery
    if (message) {
      this.chatGateway.emitMessage(message);
    }

    return message;
  }

  @Post('communities/:id/broadcast')
  @ApiOperation({
    summary: 'Broadcast to community',
    description: 'Send a message to all members of a community.',
  })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiResponse({
    status: 201,
    description: 'Community broadcast sent successfully.',
  })
  async broadcastToCommunity(
    @Request() req,
    @Param('id') communityId: string,
    @Body() dto: SendMessageDto,
  ) {
    const message = await this.chatService.broadcastToCommunity(
      req.user.id,
      communityId,
      dto,
    );

    if (message) {
      this.chatGateway.emitMessage(message);
    }

    return message;
  }

  @Post('dashboard/broadcast')
  @ApiOperation({
    summary: 'Dashboard broadcast',
    description: 'Send a broadcast from the dashboard to target users.',
  })
  @ApiAdminOnly()
  @ApiResponse({
    status: 201,
    description: 'Dashboard broadcast sent successfully.',
  })
  async sendDashboardBroadcast(
    @Request() req,
    @Body() dto: SendMessageDto & { targetUserIds: string[] },
  ) {
    const message = await this.chatService.sendDashboardBroadcast(
      req.user.id,
      dto,
    );

    if (message) {
      this.chatGateway.emitMessage(message);
    }

    return message;
  }

  @Get('broadcasts/sent')
  @ApiOperation({
    summary: 'Get sent broadcasts',
    description: 'Retrieve broadcasts sent by the user.',
  })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiResponse({
    status: 200,
    description: 'Sent broadcasts retrieved successfully.',
  })
  async getUserBroadcasts(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const broadcasts = await this.chatService.getUserBroadcasts(
      req.user.id,
      limit ? parseInt(limit) : 50,
      skip ? parseInt(skip) : 0,
    );
    return broadcasts;
  }

  @Get('broadcasts/received')
  @ApiOperation({
    summary: 'Get received broadcasts',
    description: 'Retrieve broadcasts received by the user.',
  })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiResponse({
    status: 200,
    description: 'Received broadcasts retrieved successfully.',
  })
  async getUserBroadcastMessages(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const broadcasts = await this.chatService.getUserBroadcastMessages(
      req.user.id,
      limit ? parseInt(limit) : 50,
      skip ? parseInt(skip) : 0,
    );
    return broadcasts;
  }

  // ==================== CONVERSATION ENDPOINTS ====================

  @UseGuards(AuthGuard)
  @Get('conversations/:id')
  @ApiOperation({
    summary: 'Get conversation',
    description: 'Retrieve a conversation by ID.',
  })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation retrieved successfully.',
  })
  async getConversation(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    console.log('📋 Getting conversation:', id, 'for user:', userId);
    return this.chatService.getConversation(id);
  }

  // ==================== FILE UPLOAD ENDPOINTS ====================

  @Post('upload')
  @ApiOperation({
    summary: 'Upload file',
    description: 'Upload a file (image, video, audio, document) to Cloudinary.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully.' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
      },
      fileFilter: (req, file, callback) => {
        // Allow images, videos, audio, and documents
        const allowedMimes = [
          // Images
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/jpg',
          'image/bmp',
          'image/svg+xml',
          // Videos
          'video/mp4',
          'video/mpeg',
          'video/quicktime',
          'video/x-msvideo',
          'video/x-ms-wmv',
          'video/webm',
          'video/ogg',
          'video/3gpp',
          'video/x-flv',
          // Audio
          'audio/mpeg',
          'audio/wav',
          'audio/ogg',
          'audio/webm',
          'audio/aac',
          'audio/mp4',
          'audio/flac',
          'audio/x-m4a',
          // Documents
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/plain',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          console.error(`❌ Rejected file type: ${file.mimetype}`);
          callback(
            new BadRequestException(
              `Invalid file type: ${file.mimetype}. Allowed types: images, videos, audio, and documents.`,
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      console.log('📤 Uploading file to Cloudinary:', {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });

      // Upload to Cloudinary
      const result = await this.cloudinaryService.uploadFile(file, 'chat');

      return {
        url: result.url,
        publicId: result.publicId,
        filename: file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        format: result.format,
      };
    } catch (error) {
      console.error('❌ File upload failed:', error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  // ==================== CONVERSATION ENDPOINTS ====================

  @UseGuards(AuthGuard)
  @Get('conversations')
  @ApiOperation({
    summary: 'Get user conversations',
    description: 'Retrieve all conversations for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversations retrieved successfully.',
  })
  async getUserConversations(@Request() req) {
    console.log('📥 GET /chat/conversations called for user:', req.user.id);
    const conversations = await this.chatService.getUserConversations(
      req.user.id,
    );
    console.log(
      '📤 Returning',
      conversations.length,
      'conversations for user:',
      req.user.id,
    );
    return conversations;
  }

  @Get('user/status/:userId')
  @ApiOperation({
    summary: 'Get user online status',
    description: 'Check if a specific user is currently online.',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User status retrieved successfully.',
  })
  async getUserStatus(@Param('userId') userId: string) {
    const isOnline = await this.chatService.isUserOnline(userId);
    return { userId, isOnline };
  }

  @Post('conversations/:id/archive')
  @ApiOperation({
    summary: 'Archive conversation',
    description: 'Archive a conversation.',
  })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation archived successfully.',
  })
  async archiveConversation(@Request() req, @Param('id') id: string) {
    return this.chatService.archiveConversation(req.user.id, id);
  }

  @Post('conversations/:id/mute')
  @ApiOperation({
    summary: 'Mute/Unmute conversation',
    description: 'Mute or unmute notifications for a conversation.',
  })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiBody({
    schema: { type: 'object', properties: { muted: { type: 'boolean' } } },
  })
  @ApiResponse({
    status: 200,
    description: 'Conversation mute status updated successfully.',
  })
  async muteConversation(
    @Request() req,
    @Param('id') id: string,
    @Body('muted') muted: boolean,
  ) {
    return this.chatService.muteConversation(req.user.id, id, muted);
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread message count',
    description: 'Get total count of unread messages for the user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully.',
  })
  async getUnreadCount(@Request() req) {
    return this.chatService.getUnreadCount(req.user.id);
  }

  // ==================== COMMUNITY ENDPOINTS ====================

  @Post('communities')
  @ApiOperation({
    summary: 'Create community',
    description: 'Create a new community chat group.',
  })
  @ApiResponse({ status: 201, description: 'Community created successfully.' })
  async createCommunity(@Request() req, @Body() dto: CreateCommunityDto) {
    return this.chatService.createCommunity(req.user.id, dto);
  }

  @Get('communities')
  @ApiOperation({
    summary: 'Get user communities',
    description: 'Retrieve all communities the user is a member of.',
  })
  @ApiResponse({
    status: 200,
    description: 'Communities retrieved successfully.',
  })
  async getUserCommunities(@Request() req) {
    return this.chatService.getUserCommunities(req.user.id);
  }

  @Get('communities/:id')
  @ApiOperation({
    summary: 'Get community details',
    description: 'Retrieve details of a specific community.',
  })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiResponse({
    status: 200,
    description: 'Community details retrieved successfully.',
  })
  async getCommunity(@Param('id') id: string) {
    return this.chatService.getCommunity(id);
  }

  @Put('communities/:id')
  @ApiOperation({
    summary: 'Update community',
    description: 'Update community details (name, description, etc.).',
  })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Community updated successfully.' })
  async updateCommunity(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateCommunityDto,
  ) {
    return this.chatService.updateCommunity(req.user.id, id, dto);
  }

  @Delete('communities/:id')
  @ApiOperation({
    summary: 'Delete community',
    description: 'Delete a community permanently.',
  })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Community deleted successfully.' })
  async deleteCommunity(@Request() req, @Param('id') id: string) {
    return this.chatService.deleteCommunity(req.user.id, id);
  }

  @Post('communities/:id/members')
  @ApiOperation({
    summary: 'Add members to community',
    description: 'Add new members to an existing community.',
  })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Members added successfully.' })
  async addMembers(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: AddMembersDto,
  ) {
    return this.chatService.addMembers(req.user.id, id, dto);
  }

  @Delete('communities/:id/members/:userId')
  @ApiOperation({
    summary: 'Remove member from community',
    description: 'Remove a user from a community.',
  })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiParam({ name: 'userId', description: 'User ID to remove' })
  @ApiResponse({ status: 200, description: 'Member removed successfully.' })
  async removeMember(
    @Request() req,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.chatService.removeMember(req.user.id, id, userId);
  }

  @Post('communities/:id/admins/:userId')
  @ApiOperation({
    summary: 'Promote to admin',
    description: 'Promote a community member to admin status.',
  })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiParam({ name: 'userId', description: 'User ID to promote' })
  @ApiResponse({
    status: 200,
    description: 'Member promoted to admin successfully.',
  })
  async promoteToAdmin(
    @Request() req,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.chatService.promoteToAdmin(req.user.id, id, userId);
  }

  @Post('communities/:id/leave')
  @ApiOperation({
    summary: 'Leave community',
    description: 'Leave a community voluntarily.',
  })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Left community successfully.' })
  async leaveCommunity(@Request() req, @Param('id') id: string) {
    return this.chatService.leaveCommunity(req.user.id, id);
  }

  @Get('communities/:id/unread-count')
  @ApiOperation({
    summary: 'Get community unread count',
    description: 'Get unread message count for a specific community.',
  })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiResponse({
    status: 200,
    description: 'Community unread count retrieved successfully.',
  })
  async getCommunityUnreadCount(@Request() req, @Param('id') id: string) {
    return this.chatService.getCommunityUnreadCount(req.user.id, id);
  }

  // ==================== OFFLINE MESSAGE QUEUE ====================

  @Get('queued-messages')
  @ApiOperation({
    summary: 'Get queued messages',
    description: 'Retrieve messages queued while offline.',
  })
  @ApiResponse({
    status: 200,
    description: 'Queued messages retrieved successfully.',
  })
  async getQueuedMessages(@Request() req) {
    return this.chatService.getQueuedMessages(req.user.id);
  }

  @Get('queue-status')
  @ApiOperation({
    summary: 'Get queue status',
    description: 'Get status of the offline message queue.',
  })
  @ApiResponse({
    status: 200,
    description: 'Queue status retrieved successfully.',
  })
  async getQueueStatus(@Request() req) {
    return this.chatService.getQueueStatus(req.user.id);
  }
}
