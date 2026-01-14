import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CloudinaryService } from '../common/cloudinary.service';
import { Message, MessageSchema } from './schemas/message.schema';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { Community, CommunitySchema } from './schemas/community.schema';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Community.name, schema: CommunitySchema },
    ]),
    ConfigModule,
    RedisModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, CloudinaryService],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
