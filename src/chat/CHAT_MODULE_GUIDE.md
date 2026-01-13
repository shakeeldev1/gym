# Chat Module Installation & Setup Guide

## Overview
Complete WhatsApp-like chat system with Socket.IO real-time messaging, communities, voice notes, and broadcast messages.

## Features Implemented
✅ Real-time messaging with Socket.IO
✅ One-on-one conversations
✅ Group communities (public/private/announcement)
✅ Voice notes and media uploads
✅ Broadcast messages
✅ Read receipts and typing indicators
✅ Message deletion
✅ Community management (admins, members, banned users)
✅ Unread message counts
✅ Archive and mute conversations

## Installation Steps

### 1. Install Dependencies
```bash
cd Server
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io @nestjs/platform-express multer @types/multer
```

### 2. Create Upload Directory
```bash
mkdir -p uploads/chat
```

### 3. Configure CORS for Socket.IO
In `main.ts`, add Socket.IO CORS configuration:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for HTTP
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });
  
  await app.listen(3000);
}
bootstrap();
```

Socket.IO CORS is already configured in ChatGateway.

### 4. Add Environment Variables
Add to `.env`:
```
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### Messages
- `POST /chat/messages` - Send a message
- `GET /chat/messages?conversationId=xxx` - Get messages from conversation
- `GET /chat/messages?communityId=xxx` - Get messages from community
- `GET /chat/messages/:id` - Get single message
- `POST /chat/messages/read` - Mark messages as read
- `DELETE /chat/messages/:id` - Delete message
- `POST /chat/broadcast` - Send broadcast message

### File Upload
- `POST /chat/upload` - Upload voice note or media (multipart/form-data)

### Conversations
- `GET /chat/conversations` - Get user's conversations
- `POST /chat/conversations/:id/archive` - Archive conversation
- `POST /chat/conversations/:id/mute` - Mute/unmute conversation
- `GET /chat/unread-count` - Get total unread count

### Communities
- `POST /chat/communities` - Create community
- `GET /chat/communities` - Get user's communities
- `GET /chat/communities/:id` - Get community details
- `PUT /chat/communities/:id` - Update community
- `DELETE /chat/communities/:id` - Delete community
- `POST /chat/communities/:id/members` - Add members
- `DELETE /chat/communities/:id/members/:userId` - Remove member
- `POST /chat/communities/:id/admins/:userId` - Promote to admin
- `POST /chat/communities/:id/leave` - Leave community
- `GET /chat/communities/:id/unread-count` - Get unread count for community

## Socket.IO Events

### Client → Server Events

#### Connection
```typescript
// Connect with authentication
socket.auth = { token: 'your-jwt-token' };
socket.connect();
```

#### Send Message
```typescript
socket.emit('send:message', {
  recipient: 'userId', // for one-on-one
  community: 'communityId', // for community message
  type: 'text', // text | voice | image | file | system
  content: 'Hello!',
  mediaUrl: 'https://...', // optional
  mediaDuration: 30, // optional, for voice notes
  replyTo: 'messageId', // optional
  isBroadcast: false,
  broadcastRecipients: ['userId1', 'userId2'], // for broadcast
});
```

#### Typing Indicators
```typescript
// Start typing
socket.emit('typing:start', {
  conversationId: 'xxx', // for one-on-one
  communityId: 'xxx', // for community
});

// Stop typing
socket.emit('typing:stop', {
  conversationId: 'xxx',
  communityId: 'xxx',
});
```

#### Mark as Read
```typescript
socket.emit('message:read', {
  messageId: 'xxx',
  conversationId: 'xxx',
  communityId: 'xxx',
});
```

#### Delete Message
```typescript
socket.emit('message:delete', {
  messageId: 'xxx',
});
```

#### Voice Upload Progress
```typescript
socket.emit('voice:uploading', {
  recipient: 'userId',
  community: 'communityId',
  progress: 50, // 0-100
});
```

### Server → Client Events

#### New Message
```typescript
socket.on('message:new', (message) => {
  // Handle new message
  console.log('New message:', message);
});
```

#### Message Status
```typescript
socket.on('message:status', (data) => {
  // { messageId, status: 'delivered' | 'read' }
  console.log('Message status updated:', data);
});
```

#### Typing Status
```typescript
socket.on('typing:status', (data) => {
  // { userId, conversationId, communityId, isTyping }
  console.log('User typing:', data);
});
```

#### Message Deleted
```typescript
socket.on('message:deleted', (data) => {
  // { messageId, conversationId, communityId }
  console.log('Message deleted:', data);
});
```

#### Voice Upload Progress
```typescript
socket.on('voice:progress', (data) => {
  // { userId, conversationId, communityId, progress }
  console.log('Voice upload progress:', data);
});
```

## Usage Examples

### Send Text Message
```typescript
// REST API
const response = await fetch('http://localhost:3000/chat/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token',
  },
  body: JSON.stringify({
    recipient: 'userId',
    type: 'text',
    content: 'Hello!',
  }),
});
```

### Send Voice Note
```typescript
// 1. Upload voice file
const formData = new FormData();
formData.append('file', voiceBlob, 'voice.mp3');

const uploadResponse = await fetch('http://localhost:3000/chat/upload', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer your-jwt-token' },
  body: formData,
});

const { url, size } = await uploadResponse.json();

// 2. Send message with voice URL
socket.emit('send:message', {
  recipient: 'userId',
  type: 'voice',
  mediaUrl: url,
  mediaDuration: 30, // seconds
  mediaSize: size,
  mimeType: 'audio/mpeg',
});
```

### Create Community
```typescript
const response = await fetch('http://localhost:3000/chat/communities', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token',
  },
  body: JSON.stringify({
    name: 'Fitness Group',
    description: 'Daily fitness tips and motivation',
    type: 'private', // public | private | announcement
    members: ['userId1', 'userId2'],
    admins: ['userId3'],
    settings: {
      allowMembersToPost: true,
      allowMembersToAddOthers: false,
    },
  }),
});
```

### Send Broadcast Message
```typescript
// Admin sending to multiple users
const response = await fetch('http://localhost:3000/chat/broadcast', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-jwt-token',
  },
  body: JSON.stringify({
    isBroadcast: true,
    broadcastRecipients: ['userId1', 'userId2', 'userId3'],
    type: 'text',
    content: 'Important announcement for all users!',
  }),
});
```

## File Structure
```
chat/
├── schemas/
│   ├── message.schema.ts       # Message model
│   ├── conversation.schema.ts  # One-on-one conversations
│   └── community.schema.ts     # Group communities
├── dto/
│   ├── send-message.dto.ts     # Message DTOs
│   ├── community.dto.ts        # Community DTOs
│   └── message-query.dto.ts    # Query DTOs
├── chat.controller.ts          # REST endpoints
├── chat.service.ts             # Business logic
├── chat.gateway.ts             # Socket.IO gateway
└── chat.module.ts              # Module definition
```

## Security Features
- JWT authentication for Socket.IO connections
- File upload validation (type, size)
- Permission checks (admin-only operations)
- Blocked/banned user handling
- Rate limiting (recommended to add)

## Next Steps
1. Install dependencies (see above)
2. Create uploads directory
3. Test endpoints with Postman/Thunder Client
4. Integrate Socket.IO client in frontend
5. Add rate limiting for message sending
6. Set up cloud storage for production (S3, Cloudinary)
7. Add message encryption for privacy
8. Implement push notifications

## Troubleshooting

### Socket.IO Connection Failed
- Check CORS configuration in chat.gateway.ts
- Verify JWT token is valid
- Check frontend Socket.IO client version matches server

### File Upload Failed
- Verify uploads/chat directory exists
- Check file size limits (default 50MB)
- Verify file type is allowed

### Messages Not Appearing
- Check database connection
- Verify user is member of conversation/community
- Check Socket.IO connection status
