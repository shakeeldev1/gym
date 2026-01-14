import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkAsReadDto } from './dto/message-query.dto';
import { RedisService } from '../redis/redis.service';
import { MessageStatus } from './schemas/message.schema';

@WebSocketGateway({
  cors: {
    origin: '*', // Configure based on your frontend URL
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('ChatGateway');
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(
    private readonly chatService: ChatService,
    private readonly redisService: RedisService,
  ) {}

  // Public method to emit messages from REST API
  async emitMessage(message: any) {
    try {
      // Extract recipient ID if it's an object
      const recipientId = typeof message.recipient === 'object' 
        ? message.recipient?._id || message.recipient?.id
        : message.recipient;

      // Extract sender ID if it's an object
      const senderId = typeof message.sender === 'object'
        ? message.sender?._id || message.sender?.id
        : message.sender;

      if (recipientId) {
        // One-on-one message
        this.logger.log(`👤 [REST API] Emitting to recipient ${recipientId}`);

        // Emit to recipient's user room
        this.logger.log(`🚀 [REST] Emitting message:received to user:${recipientId}`);
        console.log(`🚀 [REST API] Server emitting to room: user:${recipientId}`);
        console.log(`🚀 [REST API] Message ID: ${message._id}`);
        this.server.to(`user:${recipientId}`).emit('message:received', message);
        
        // Also emit to sender for multi-device support with updated status
        if (senderId) {
          this.logger.log(`🚀 [REST] Emitting message:sent to user:${senderId}`);
          this.server.to(`user:${senderId}`).emit('message:sent', message);
        }
        
        // Also emit to conversation room if it exists
        if (message.conversation) {
          this.logger.log(`🚀 [REST] Emitting to conversation:${message.conversation}`);
          this.server.to(`conversation:${message.conversation}`).emit('message:received', message);
        }
      } else if (message.community) {
        // Community message
        this.logger.log(`👥 [REST] Emitting to community: ${message.community}`);
        this.server.to(`community:${message.community}`).emit('message:received', message);
      }
    } catch (error) {
      this.logger.error('Error emitting message:', error);
    }
  }

  async handleConnection(client: Socket) {
    try {
      // Extract user ID from handshake (sent from client during connection)
      const userId = client.handshake.query.userId as string;
      
      console.log('🔌 Socket connection attempt:');
      console.log('   Socket ID:', client.id);
      console.log('   User ID from query:', userId);
      console.log('   Query params:', client.handshake.query);
      
      if (!userId) {
        console.log('❌ No userId provided, disconnecting');
        client.disconnect();
        return;
      }

      this.connectedUsers.set(userId, client.id);
      client.data.userId = userId;

      console.log('✅ User registered in connectedUsers map');
      console.log('   connectedUsers size:', this.connectedUsers.size);
      console.log('   Current connections:', Array.from(this.connectedUsers.entries()));

      // Mark user as online in Redis
      await this.redisService.setUserOnline(userId, client.id);
      this.logger.log(`✅ User ${userId} connected (Socket: ${client.id})`);

      // Join user's personal room
      client.join(`user:${userId}`);
      this.logger.log(`✅ User ${userId} joined room: user:${userId}`);

      // Join user's community rooms
      const communities = await this.chatService.getUserCommunities(userId);
      communities.forEach(community => {
        client.join(`community:${community._id}`);
      });

      // Notify user is online to all connected clients
      this.server.emit('user:online', { userId });
      this.logger.log(`📢 Broadcasted online status for user ${userId}`);
      
      // Deliver queued messages to coming-online user
      const queuedData = await this.chatService.getQueuedMessages(userId);
      if (queuedData.count > 0) {
        client.emit('queued:messages', queuedData.queuedMessages);
        this.logger.log(`📬 Sent ${queuedData.count} queued messages to ${userId}`);

        // Process delivery acknowledgments from queue
        queuedData.queuedMessages.forEach(async (queuedItem) => {
          if (queuedItem.type === 'delivery:acknowledgment') {
            try {
              const message = await this.chatService.getMessage(queuedItem.messageId);
              if (message && message.status === MessageStatus.SENT) {
                message.status = MessageStatus.DELIVERED;
                await message.save();
                this.logger.log(`✅ Processed queued delivery acknowledgment: ${queuedItem.messageId}`);

                // Notify sender
                const senderId = typeof message.sender === 'object' 
                  ? message.sender?._id || message.sender?.id
                  : message.sender;

                if (senderId) {
                  this.server.to(`user:${senderId}`).emit('message:status:update', {
                    messageId: queuedItem.messageId,
                    conversationId: queuedItem.conversationId,
                    status: 'delivered',
                  });
                  this.logger.log(`📤 Sent queued status update to sender: ${senderId}`);
                }
              }
            } catch (error) {
              this.logger.error('Error processing queued delivery acknowledgment:', error);
            }
          }
        });
      }
      
      console.log(`✅ User ${userId} connected with socket ${client.id}`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      // Mark user as offline in Redis
      await this.redisService.setUserOffline(userId);
      this.server.emit('user:offline', { userId });
      this.logger.log(`❌ User ${userId} disconnected and marked offline`);
    }
  }

  @SubscribeMessage('send:message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    try {
      const senderId = client.data.userId;
      
      this.logger.log(`📨 Sending message from ${senderId} to ${data.recipient || data.community}`);
      
      // Save message to database
      const message = await this.chatService.sendMessage(senderId, data);
      
      if (!message) {
        this.logger.error('❌ Failed to save message');
        return { success: false, error: 'Failed to save message' };
      }
      
      this.logger.log(`✅ Message saved: ${message._id}, conversation: ${message.conversation}`);

      // Emit to appropriate room(s)
      if (data.isBroadcast && data.broadcastRecipients) {
        // Broadcast message to multiple users
        this.logger.log(`📢 Broadcasting to ${data.broadcastRecipients.length} users`);
        data.broadcastRecipients.forEach(recipientId => {
          this.server.to(`user:${recipientId}`).emit('message:received', message);
        });
      } else if (data.community) {
        // Community message
        this.logger.log(`👥 Emitting to community: ${data.community}`);
        this.server.to(`community:${data.community}`).emit('message:received', message);
      } else if (data.recipient) {
        // One-on-one message
        this.logger.log(`👤 Emitting to recipient ${data.recipient} and sender ${senderId}`);
        if (message.conversation) {
          this.logger.log(`📡 Message conversation: ${message.conversation}`);
        }
        
        // Check if recipient is connected
        const recipientSocketId = this.connectedUsers.get(data.recipient);
        if (recipientSocketId) {
          this.logger.log(`✅ Recipient ${data.recipient} is online with socket: ${recipientSocketId}`);
        } else {
          this.logger.warn(`⚠️ Recipient ${data.recipient} is offline - message will be queued`);
        }
        
        // Emit to recipient's user room
        this.logger.log(`🚀 About to emit message:received to user:${data.recipient}`);
        console.log(`🚀 Server emitting to room: user:${data.recipient}`);
        console.log(`🚀 Message ID: ${message._id}, Content: ${message.content}`);
        this.server.to(`user:${data.recipient}`).emit('message:received', message);
        this.logger.log(`✅ Emitted message:received to user:${data.recipient}`);
        
        // Also emit to sender for multi-device support
        this.logger.log(`🚀 About to emit message:sent to user:${senderId}`);
        this.server.to(`user:${senderId}`).emit('message:sent', message);
        this.logger.log(`✅ Emitted message:sent to user:${senderId}`);
        
        // Also emit to conversation room if it exists
        if (message.conversation) {
          this.logger.log(`🚀 About to emit to conversation:${message.conversation}`);
          this.server.to(`conversation:${message.conversation}`).emit('message:received', message);
          this.logger.log(`✅ Emitted to conversation room: conversation:${message.conversation}`);
        }
      }

      return { success: true, message };
    } catch (error) {
      this.logger.error('Send message error:', error);
      console.error('Send message error:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId?: string; communityId?: string },
  ) {
    const userId = client.data.userId;
    
    if (data.communityId) {
      this.server.to(`community:${data.communityId}`).emit('typing:start', {
        userId,
        communityId: data.communityId,
      });
    } else if (data.conversationId) {
      client.to(`conversation:${data.conversationId}`).emit('typing:start', {
        userId,
        conversationId: data.conversationId,
      });
    }
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId?: string; communityId?: string },
  ) {
    const userId = client.data.userId;
    
    if (data.communityId) {
      this.server.to(`community:${data.communityId}`).emit('typing:stop', {
        userId,
        communityId: data.communityId,
      });
    } else if (data.conversationId) {
      client.to(`conversation:${data.conversationId}`).emit('typing:stop', {
        userId,
        conversationId: data.conversationId,
      });
    }
  }

  @SubscribeMessage('join:conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const userId = client.data.userId;
      const conversationId = data.conversationId;
      
      // Join the conversation room
      client.join(`conversation:${conversationId}`);
      this.logger.log(`👤 User ${userId} joined conversation room: conversation:${conversationId}`);
      
      return { success: true };
    } catch (error) {
      this.logger.error('Join conversation error:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('join:community')
  handleJoinCommunity(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { communityId: string },
  ) {
    try {
      const userId = client.data.userId;
      const communityId = data.communityId;
      
      // Join the community room
      client.join(`community:${communityId}`);
      this.logger.log(`👥 User ${userId} joined community room: community:${communityId}`);
      
      return { success: true };
    } catch (error) {
      this.logger.error('Join community error:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('message:delivered')
  async handleMessageDelivered(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; conversationId: string; recipientId: string },
  ) {
    try {
      this.logger.log(`📬 Message delivered acknowledgment: ${data.messageId} to ${data.recipientId}`);

      // Check if recipient is actually online
      const isRecipientOnline = this.connectedUsers.has(data.recipientId);
      this.logger.log(`👤 Recipient ${data.recipientId} online status: ${isRecipientOnline}`);

      // Update message status in database
      const message = await this.chatService.getMessage(data.messageId);
      if (message) {
        // Only mark as delivered if recipient is online AND message is still in sent status
        if (isRecipientOnline && message.status === MessageStatus.SENT) {
          message.status = MessageStatus.DELIVERED;
          await message.save();
          this.logger.log(`✅ Updated message ${data.messageId} status to delivered (recipient online)`);
        } else if (!isRecipientOnline && message.status === MessageStatus.SENT) {
          // Queue for later delivery notification when recipient comes online
          await this.redisService.queueMessageForUser(data.recipientId, {
            type: 'delivery:acknowledgment',
            messageId: data.messageId,
            conversationId: data.conversationId,
            recipientId: data.recipientId,
            deliveredAt: new Date().toISOString(),
          });
          this.logger.log(`📦 Queued delivery acknowledgment for offline user: ${data.recipientId}`);
        }

        // Notify sender that message was delivered (if recipient is online)
        if (isRecipientOnline) {
          const senderId = typeof message.sender === 'object' 
            ? message.sender?._id || message.sender?.id
            : message.sender;
  
          if (senderId) {
            this.server.to(`user:${senderId}`).emit('message:status:update', {
              messageId: data.messageId,
              conversationId: data.conversationId,
              status: 'delivered',
            });
            this.logger.log(`📤 Sent status update to sender: ${senderId}`);
          }
        }
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Message delivered error:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('message:read')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MarkAsReadDto,
  ) {
    try {
      const userId = client.data.userId;
      await this.chatService.markAsRead(userId, data);

      // Notify sender that message was read
      if (data.messageId) {
        const message = await this.chatService.getMessage(data.messageId);
        if (message) {
          const conversationId = typeof message.conversation === 'object' 
            ? message.conversation?._id || message.conversation?.id
            : message.conversation;
          
          this.server.to(`user:${message.sender}`).emit('message:read', {
            messageId: data.messageId,
            conversationId: conversationId,
            readBy: userId,
            readAt: new Date(),
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Mark as read error:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('message:delete')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    try {
      const userId = client.data.userId;
      const result = await this.chatService.deleteMessage(userId, data.messageId);

      if (result) {
        // Notify all participants
        if (result.community) {
          this.server.to(`community:${result.community}`).emit('message:deleted', {
            messageId: data.messageId,
          });
        } else if (result.conversation) {
          this.server.to(`conversation:${result.conversation}`).emit('message:deleted', {
            messageId: data.messageId,
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Delete message error:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('voice:uploading')
  handleVoiceUploading(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId?: string; communityId?: string; progress: number },
  ) {
    const userId = client.data.userId;
    
    if (data.communityId) {
      this.server.to(`community:${data.communityId}`).emit('voice:uploading', {
        userId,
        progress: data.progress,
      });
    } else if (data.conversationId) {
      client.to(`conversation:${data.conversationId}`).emit('voice:uploading', {
        userId,
        progress: data.progress,
      });
    }
  }

  @SubscribeMessage('voice:recording:start')
  handleVoiceRecordingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { recipientId: string; senderId: string },
  ) {
    const { recipientId, senderId } = data;
    this.logger.log(`🎤 [Recording Start] User ${senderId} started recording for ${recipientId}`);
    
    // Emit to recipient that sender is recording
    this.server.to(`user:${recipientId}`).emit('voice:recording:start', {
      senderId,
    });
  }

  @SubscribeMessage('voice:recording:stop')
  handleVoiceRecordingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { recipientId: string; senderId: string },
  ) {
    const { recipientId, senderId } = data;
    this.logger.log(`🎤 [Recording Stop] User ${senderId} stopped recording for ${recipientId}`);
    
    // Emit to recipient that sender stopped recording
    this.server.to(`user:${recipientId}`).emit('voice:recording:stop', {
      senderId,
    });
  }

  // Method to emit to specific user (can be called from service)
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Method to emit to community
  emitToCommunity(communityId: string, event: string, data: any) {
    this.server.to(`community:${communityId}`).emit(event, data);
  }

  // Method to add user to community room (when they join a community)
  async addUserToCommunityRoom(userId: string, communityId: string) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        socket.join(`community:${communityId}`);
      }
    }
  }

  // Method to remove user from community room (when they leave)
  async removeUserFromCommunityRoom(userId: string, communityId: string) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(`community:${communityId}`);
      }
    }
  }
}
