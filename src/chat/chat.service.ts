import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument, MessageStatus } from './schemas/message.schema';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Community, CommunityDocument } from './schemas/community.schema';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateCommunityDto, UpdateCommunityDto, AddMembersDto } from './dto/community.dto';
import { GetMessagesDto, MarkAsReadDto } from './dto/message-query.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger('ChatService');

  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Community.name) private communityModel: Model<CommunityDocument>,
    private redisService: RedisService,
  ) {}

  // ==================== MESSAGE OPERATIONS ====================

  async sendMessage(senderId: string, dto: SendMessageDto) {
    const senderObjectId = new Types.ObjectId(senderId);

    // Validate that either recipient or community is provided
    if (!dto.recipient && !dto.community && !dto.isBroadcast) {
      throw new BadRequestException('Either recipient, community, or broadcast recipients must be provided');
    }

    let conversationId: Types.ObjectId | undefined;

    // Handle one-on-one message
    if (dto.recipient) {
      const recipientObjectId = new Types.ObjectId(dto.recipient);
      
      // Use provided conversation ID if available, otherwise find or create
      if (dto.conversation) {
        conversationId = new Types.ObjectId(dto.conversation);
        
        // Validate conversation exists and includes both users
        const conversation = await this.conversationModel.findById(conversationId);
        if (!conversation) {
          throw new NotFoundException('Conversation not found');
        }
        
        // Verify both users are participants
        const participants = conversation.participants.map(p => p.toString());
        if (!participants.includes(senderId) || !participants.includes(dto.recipient)) {
          throw new ForbiddenException('You are not a participant in this conversation');
        }
      } else {
        // Auto-create conversation if not provided
        const conversation = await this.findOrCreateConversation(senderObjectId, recipientObjectId);
        conversationId = conversation._id as Types.ObjectId;
      }
    }

    // Handle community message
    if (dto.community) {
      const community = await this.communityModel.findById(dto.community);
      if (!community) {
        throw new NotFoundException('Community not found');
      }

      // Check if user is member
      if (!community.members.some(m => m.toString() === senderId)) {
        throw new ForbiddenException('You are not a member of this community');
      }

      // Check if user can post
      if (community.type === 'announcement' && !community.admins.some(a => a.toString() === senderId)) {
        throw new ForbiddenException('Only admins can post in announcement communities');
      }
    }

    // Create message
    const message = new this.messageModel({
      sender: senderObjectId,
      recipient: dto.recipient ? new Types.ObjectId(dto.recipient) : undefined,
      community: dto.community ? new Types.ObjectId(dto.community) : undefined,
      conversation: conversationId,
      type: dto.type,
      content: dto.content,
      mediaUrl: dto.mediaUrl,
      mediaDuration: dto.mediaDuration,
      mediaSize: dto.mediaSize,
      mimeType: dto.mimeType,
      replyTo: dto.replyTo ? new Types.ObjectId(dto.replyTo) : undefined,
      isBroadcast: dto.isBroadcast || false,
      broadcastRecipients: dto.broadcastRecipients?.map(id => new Types.ObjectId(id)),
      status: MessageStatus.SENT,
    });

    await message.save();

    // Update conversation/community last message
    if (conversationId) {
      await this.conversationModel.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        lastMessageAt: new Date(),
        $inc: { [`unreadCount.${dto.recipient}`]: 1 },
      });
    }

    if (dto.community) {
      await this.communityModel.findByIdAndUpdate(dto.community, {
        lastMessage: message._id,
        lastMessageAt: new Date(),
      });
    }

    // Queue message for offline recipient
    if (dto.recipient) {
      const isRecipientOnline = await this.redisService.isUserOnline(dto.recipient);
      if (!isRecipientOnline) {
        await this.redisService.queueMessageForUser(dto.recipient, {
          messageId: message._id.toString(),
          conversationId: conversationId?.toString(),
          sender: message.sender,
          type: message.type,
          content: message.content,
          mediaUrl: message.mediaUrl,
          createdAt: (message as any).createdAt || new Date(),
        });
        this.logger.log(`📦 Message queued for offline user ${dto.recipient}`);
      }
    }

    // Fetch the saved message fresh from DB and populate all references
    const savedMessage = await this.messageModel.findById(message._id).populate([
      { path: 'sender', select: '_id name email role' },
      { path: 'recipient', select: '_id name email role' },
      { path: 'replyTo' },
    ]);

    this.logger.log(`📤 Message saved and populated: sender=${savedMessage?.sender?._id}, recipient=${savedMessage?.recipient?._id}`);
    return savedMessage;
  }

  async getMessages(query: GetMessagesDto) {
    const filter: any = { isDeleted: false };
    const limit = query.limit || 50;
    const skip = query.skip || 0;

    if (query.conversationId) {
      filter.conversation = new Types.ObjectId(query.conversationId);
    }

    if (query.communityId) {
      filter.community = new Types.ObjectId(query.communityId);
    }

    if (query.before) {
      filter._id = { $lt: new Types.ObjectId(query.before) };
    }

    if (query.after) {
      filter._id = { $gt: new Types.ObjectId(query.after) };
    }

    const messages = await this.messageModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate({
        path: 'sender',
        select: '_id name email role',
      })
      .populate({
        path: 'recipient',
        select: '_id name email role',
      })
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: '_id name' },
      })
      .exec();

    return messages.reverse(); // Return in ascending order (oldest first)
  }

  async getMessage(messageId: string) {
    return this.messageModel.findById(messageId).populate(['sender', 'recipient']).exec();
  }

  async markAsRead(userId: string, dto: MarkAsReadDto) {
    let updatedCount = 0;
    
    if (dto.messageId) {
      // Mark single message as read
      const message = await this.messageModel.findById(dto.messageId);
      if (message && message.recipient?.toString() === userId) {
        message.status = MessageStatus.READ;
        message.readAt = new Date();
        await message.save();
        updatedCount = 1;
      }
    }

    if (dto.conversationId) {
      // Mark all messages in conversation as read
      const result = await this.messageModel.updateMany(
        {
          conversation: new Types.ObjectId(dto.conversationId),
          recipient: new Types.ObjectId(userId),
          status: { $ne: MessageStatus.READ },
        },
        {
          status: MessageStatus.READ,
          readAt: new Date(),
        },
      );
      updatedCount = result.modifiedCount || 0;

      // Reset unread count
      await this.conversationModel.findByIdAndUpdate(dto.conversationId, {
        [`unreadCount.${userId}`]: 0,
        [`lastReadAt.${userId}`]: new Date(),
      });
    }

    if (dto.communityId) {
      // Update user's last read time for community
      await this.communityModel.findByIdAndUpdate(dto.communityId, {
        [`lastReadAt.${userId}`]: new Date(),
      });
    }
    
    return updatedCount;
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.messageModel.findById(messageId);
    
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.sender.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    return message;
  }

  // ==================== CONVERSATION OPERATIONS ====================

  async findOrCreateConversation(user1: Types.ObjectId, user2: Types.ObjectId) {
    // Check if conversation exists
    let conversation = await this.conversationModel.findOne({
      participants: { $all: [user1, user2], $size: 2 },
    });

    if (!conversation) {
      // Create new conversation
      conversation = new this.conversationModel({
        participants: [user1, user2],
        unreadCount: new Map(),
        lastReadAt: new Map(),
        isMuted: new Map(),
        isBlocked: new Map(),
      });
      await conversation.save();
    }

    return conversation;
  }

  async getConversation(conversationId: string) {
    const conversation = await this.conversationModel
      .findById(conversationId)
      .populate('participants', '_id name email role')
      .populate('lastMessage')
      .exec();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async getUserConversations(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    
    return this.conversationModel
      .find({
        participants: userObjectId,
        archivedBy: { $ne: userObjectId },
      })
      .populate(['participants', 'lastMessage'])
      .sort({ lastMessageAt: -1 })
      .exec();
  }

  async archiveConversation(userId: string, conversationId: string) {
    const userObjectId = new Types.ObjectId(userId);
    
    return this.conversationModel.findByIdAndUpdate(
      conversationId,
      {
        $addToSet: { archivedBy: userObjectId },
      },
      { new: true },
    );
  }

  async muteConversation(userId: string, conversationId: string, muted: boolean) {
    return this.conversationModel.findByIdAndUpdate(
      conversationId,
      {
        [`isMuted.${userId}`]: muted,
      },
      { new: true },
    );
  }

  // ==================== COMMUNITY OPERATIONS ====================

  async createCommunity(creatorId: string, dto: CreateCommunityDto) {
    const creatorObjectId = new Types.ObjectId(creatorId);
    
    const community = new this.communityModel({
      name: dto.name,
      description: dto.description,
      imageUrl: dto.imageUrl,
      createdBy: creatorObjectId,
      admins: [creatorObjectId, ...(dto.admins?.map(id => new Types.ObjectId(id)) || [])],
      members: [
        creatorObjectId,
        ...(dto.members?.map(id => new Types.ObjectId(id)) || []),
        ...(dto.admins?.map(id => new Types.ObjectId(id)) || []),
      ],
      type: dto.type || 'private',
      settings: dto.settings,
    });

    await community.save();
    return community.populate(['createdBy', 'admins', 'members']);
  }

  async updateCommunity(userId: string, communityId: string, dto: UpdateCommunityDto) {
    const community = await this.communityModel.findById(communityId);
    
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Check if user is admin
    if (!community.admins.some(admin => admin.toString() === userId)) {
      throw new ForbiddenException('Only admins can update community');
    }

    Object.assign(community, dto);
    await community.save();
    
    return community.populate(['createdBy', 'admins', 'members']);
  }

  async addMembers(userId: string, communityId: string, dto: AddMembersDto) {
    const community = await this.communityModel.findById(communityId);
    
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Check if user is admin or if members can add others
    const isAdmin = community.admins.some(admin => admin.toString() === userId);
    const canAdd = isAdmin || community.settings?.allowMembersToAddOthers;

    if (!canAdd) {
      throw new ForbiddenException('You do not have permission to add members');
    }

    const newMembers = dto.userIds.map(id => new Types.ObjectId(id));
    
    await this.communityModel.findByIdAndUpdate(communityId, {
      $addToSet: { members: { $each: newMembers } },
    });

    return this.getCommunity(communityId);
  }

  async removeMember(userId: string, communityId: string, memberIdToRemove: string) {
    const community = await this.communityModel.findById(communityId);
    
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Check if user is admin
    if (!community.admins.some(admin => admin.toString() === userId)) {
      throw new ForbiddenException('Only admins can remove members');
    }

    // Cannot remove creator
    if (community.createdBy.toString() === memberIdToRemove) {
      throw new ForbiddenException('Cannot remove community creator');
    }

    await this.communityModel.findByIdAndUpdate(communityId, {
      $pull: {
        members: new Types.ObjectId(memberIdToRemove),
        admins: new Types.ObjectId(memberIdToRemove),
      },
    });

    return this.getCommunity(communityId);
  }

  async promoteToAdmin(userId: string, communityId: string, memberIdToPromote: string) {
    const community = await this.communityModel.findById(communityId);
    
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Only creator can promote admins
    if (community.createdBy.toString() !== userId) {
      throw new ForbiddenException('Only the creator can promote admins');
    }

    await this.communityModel.findByIdAndUpdate(communityId, {
      $addToSet: { admins: new Types.ObjectId(memberIdToPromote) },
    });

    return this.getCommunity(communityId);
  }

  async leaveCommunity(userId: string, communityId: string) {
    const community = await this.communityModel.findById(communityId);
    
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Creator cannot leave
    if (community.createdBy.toString() === userId) {
      throw new ForbiddenException('Creator cannot leave community. Delete it instead.');
    }

    await this.communityModel.findByIdAndUpdate(communityId, {
      $pull: {
        members: new Types.ObjectId(userId),
        admins: new Types.ObjectId(userId),
      },
    });

    return { message: 'Left community successfully' };
  }

  async getCommunity(communityId: string) {
    return this.communityModel
      .findById(communityId)
      .populate(['createdBy', 'admins', 'members', 'lastMessage'])
      .exec();
  }

  async getUserCommunities(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    
    return this.communityModel
      .find({
        members: userObjectId,
        isActive: true,
      })
      .populate(['createdBy', 'lastMessage'])
      .sort({ lastMessageAt: -1 })
      .exec();
  }

  async deleteCommunity(userId: string, communityId: string) {
    const community = await this.communityModel.findById(communityId);
    
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Only creator can delete
    if (community.createdBy.toString() !== userId) {
      throw new ForbiddenException('Only the creator can delete community');
    }

    await this.communityModel.findByIdAndUpdate(communityId, {
      isActive: false,
    });

    return { message: 'Community deleted successfully' };
  }

  // ==================== BROADCAST OPERATIONS ====================

  async sendBroadcast(senderId: string, dto: SendMessageDto) {
    if (!dto.broadcastRecipients || dto.broadcastRecipients.length === 0) {
      throw new BadRequestException('Broadcast recipients are required');
    }

    dto.isBroadcast = true;
    return this.sendMessage(senderId, dto);
  }

  // ==================== STATISTICS ====================

  async getUnreadCount(userId: string) {
    // Count unread messages in conversations
    const conversations = await this.conversationModel.find({
      participants: new Types.ObjectId(userId),
    });

    let totalUnread = 0;
    conversations.forEach(conv => {
      const unread = conv.unreadCount.get(userId) || 0;
      totalUnread += unread;
    });

    return { unreadCount: totalUnread };
  }

  async getCommunityUnreadCount(userId: string, communityId: string) {
    const community = await this.communityModel.findById(communityId);
    
    if (!community) {
      return { unreadCount: 0 };
    }

    const lastReadAt = community.lastReadAt.get(userId);
    
    if (!lastReadAt) {
      // Count all messages
      const count = await this.messageModel.countDocuments({
        community: new Types.ObjectId(communityId),
        isDeleted: false,
      });
      return { unreadCount: count };
    }

    // Count messages after last read
    const count = await this.messageModel.countDocuments({
      community: new Types.ObjectId(communityId),
      createdAt: { $gt: lastReadAt },
      isDeleted: false,
    });

    return { unreadCount: count };
  }

  // ==================== OFFLINE MESSAGE QUEUE ====================

  /**
   * Get queued messages for user coming online
   */
  async getQueuedMessages(userId: string) {
    const messages = await this.redisService.getQueuedMessages(userId);
    const queueLength = messages.length;

    if (messages.length > 0) {
      this.logger.log(`📬 Delivering ${messages.length} queued messages to user ${userId}`);
      // Clear the queue after retrieval
      await this.redisService.clearQueuedMessages(userId);
    }

    return {
      queuedMessages: messages,
      count: queueLength,
    };
  }

  /**
   * Get queue status for user
   */
  async getQueueStatus(userId: string) {
    const count = await this.redisService.getQueueLength(userId);
    return {
      userId,
      queuedMessageCount: count,
      hasMessages: count > 0,
    };
  }
}
