# Chat Module API Reference

## Table of Contents
1. [REST API Endpoints](#rest-api-endpoints)
2. [Socket.IO Events](#socketio-events)
3. [Data Models](#data-models)
4. [Authentication](#authentication)
5. [Examples](#examples)

---

## REST API Endpoints

### Messages

#### Send Message
```
POST /chat/messages
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "recipient": "userId",        // Optional: for one-on-one
  "community": "communityId",   // Optional: for community message
  "type": "text",               // text | voice | image | file | system
  "content": "Hello!",          // Required for text messages
  "mediaUrl": "https://...",    // Optional: for media messages
  "mediaDuration": 30,          // Optional: voice note duration in seconds
  "mediaSize": 1024000,         // Optional: file size in bytes
  "mimeType": "audio/mpeg",     // Optional: MIME type
  "replyTo": "messageId",       // Optional: replied message ID
  "isBroadcast": false,         // Optional: broadcast message
  "broadcastRecipients": []     // Optional: array of user IDs
}

Response: 201 Created
{
  "_id": "messageId",
  "sender": { ... },
  "recipient": { ... },
  "type": "text",
  "content": "Hello!",
  "status": "sent",
  "createdAt": "2024-01-13T...",
  ...
}
```

#### Get Messages
```
GET /chat/messages?conversationId={id}&limit=50&skip=0
GET /chat/messages?communityId={id}&limit=50&skip=0
GET /chat/messages?before={messageId}
GET /chat/messages?after={messageId}
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "_id": "messageId",
    "sender": { ... },
    "content": "Hello!",
    "createdAt": "2024-01-13T...",
    ...
  },
  ...
]
```

#### Get Single Message
```
GET /chat/messages/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "_id": "messageId",
  "sender": { ... },
  "recipient": { ... },
  "content": "Hello!",
  ...
}
```

#### Mark Messages as Read
```
POST /chat/messages/read
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "messageId": "xxx",           // Optional: single message
  "conversationId": "xxx",      // Optional: all in conversation
  "communityId": "xxx"          // Optional: update last read time
}

Response: 200 OK
{
  "message": "Marked as read"
}
```

#### Delete Message
```
DELETE /chat/messages/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "_id": "messageId",
  "isDeleted": true,
  "deletedAt": "2024-01-13T...",
  ...
}
```

#### Send Broadcast Message
```
POST /chat/broadcast
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "isBroadcast": true,
  "broadcastRecipients": ["userId1", "userId2", "userId3"],
  "type": "text",
  "content": "Important announcement!"
}

Response: 201 Created
{
  "_id": "messageId",
  "isBroadcast": true,
  "broadcastRecipients": [...],
  ...
}
```

### File Upload

#### Upload Media File
```
POST /chat/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body (form-data):
file: [binary file]

Allowed types:
- Images: image/jpeg, image/png, image/gif, image/webp
- Audio: audio/mpeg, audio/wav, audio/ogg, audio/webm, audio/aac, audio/mp4
- Documents: application/pdf, .doc, .docx

Max size: 50MB

Response: 200 OK
{
  "url": "/uploads/chat/file-123456.mp3",
  "filename": "file-123456.mp3",
  "originalName": "voice-note.mp3",
  "mimeType": "audio/mpeg",
  "size": 1024000
}
```

### Conversations

#### Get User's Conversations
```
GET /chat/conversations
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "_id": "conversationId",
    "participants": [{ ... }, { ... }],
    "lastMessage": { ... },
    "lastMessageAt": "2024-01-13T...",
    "unreadCount": { "userId": 3 },
    ...
  },
  ...
]
```

#### Archive Conversation
```
POST /chat/conversations/:id/archive
Authorization: Bearer {token}

Response: 200 OK
{
  "_id": "conversationId",
  "archivedBy": ["userId"],
  ...
}
```

#### Mute/Unmute Conversation
```
POST /chat/conversations/:id/mute
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "muted": true  // or false
}

Response: 200 OK
{
  "_id": "conversationId",
  "isMuted": { "userId": true },
  ...
}
```

#### Get Unread Count
```
GET /chat/unread-count
Authorization: Bearer {token}

Response: 200 OK
{
  "unreadCount": 5
}
```

### Communities

#### Create Community
```
POST /chat/communities
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "name": "Fitness Group",
  "description": "Daily fitness tips",
  "imageUrl": "https://...",
  "type": "private",              // public | private | announcement
  "members": ["userId1", "userId2"],
  "admins": ["userId3"],
  "settings": {
    "allowMembersToPost": true,
    "allowMembersToAddOthers": false,
    "maxMembers": 500
  }
}

Response: 201 Created
{
  "_id": "communityId",
  "name": "Fitness Group",
  "createdBy": { ... },
  "admins": [...],
  "members": [...],
  ...
}
```

#### Get User's Communities
```
GET /chat/communities
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "_id": "communityId",
    "name": "Fitness Group",
    "members": [...],
    ...
  },
  ...
]
```

#### Get Community Details
```
GET /chat/communities/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "_id": "communityId",
  "name": "Fitness Group",
  "description": "...",
  "members": [...],
  "admins": [...],
  ...
}
```

#### Update Community
```
PUT /chat/communities/:id
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "name": "Updated Name",
  "description": "Updated description",
  "settings": {
    "allowMembersToPost": false
  }
}

Response: 200 OK
{
  "_id": "communityId",
  "name": "Updated Name",
  ...
}
```

#### Delete Community
```
DELETE /chat/communities/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Community deleted successfully"
}
```

#### Add Members to Community
```
POST /chat/communities/:id/members
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "userIds": ["userId1", "userId2", "userId3"]
}

Response: 200 OK
{
  "_id": "communityId",
  "members": [...],
  ...
}
```

#### Remove Member from Community
```
DELETE /chat/communities/:id/members/:userId
Authorization: Bearer {token}

Response: 200 OK
{
  "_id": "communityId",
  "members": [...],
  ...
}
```

#### Promote Member to Admin
```
POST /chat/communities/:id/admins/:userId
Authorization: Bearer {token}

Response: 200 OK
{
  "_id": "communityId",
  "admins": [...],
  ...
}
```

#### Leave Community
```
POST /chat/communities/:id/leave
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Left community successfully"
}
```

#### Get Community Unread Count
```
GET /chat/communities/:id/unread-count
Authorization: Bearer {token}

Response: 200 OK
{
  "unreadCount": 10
}
```

---

## Socket.IO Events

### Connection

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

### Client → Server Events

#### Send Message
```typescript
socket.emit('send:message', {
  recipient: 'userId',       // Optional
  community: 'communityId',  // Optional
  type: 'text',
  content: 'Hello!',
  mediaUrl: 'https://...',   // Optional
  mediaDuration: 30,         // Optional
  replyTo: 'messageId',      // Optional
  isBroadcast: false,
  broadcastRecipients: []    // Optional
});
```

#### Start Typing
```typescript
socket.emit('typing:start', {
  conversationId: 'xxx',  // For one-on-one
  communityId: 'xxx'      // For community
});
```

#### Stop Typing
```typescript
socket.emit('typing:stop', {
  conversationId: 'xxx',
  communityId: 'xxx'
});
```

#### Mark as Read
```typescript
socket.emit('message:read', {
  messageId: 'xxx',
  conversationId: 'xxx',
  communityId: 'xxx'
});
```

#### Delete Message
```typescript
socket.emit('message:delete', {
  messageId: 'xxx'
});
```

#### Voice Upload Progress
```typescript
socket.emit('voice:uploading', {
  recipient: 'userId',
  community: 'communityId',
  progress: 50  // 0-100
});
```

### Server → Client Events

#### New Message
```typescript
socket.on('message:new', (message) => {
  console.log('New message:', message);
  // {
  //   _id: 'messageId',
  //   sender: { ... },
  //   content: 'Hello!',
  //   ...
  // }
});
```

#### Message Status Update
```typescript
socket.on('message:status', (data) => {
  console.log('Message status:', data);
  // {
  //   messageId: 'xxx',
  //   status: 'delivered' | 'read'
  // }
});
```

#### Typing Status
```typescript
socket.on('typing:status', (data) => {
  console.log('Typing status:', data);
  // {
  //   userId: 'xxx',
  //   conversationId: 'xxx',
  //   communityId: 'xxx',
  //   isTyping: true | false
  // }
});
```

#### Message Deleted
```typescript
socket.on('message:deleted', (data) => {
  console.log('Message deleted:', data);
  // {
  //   messageId: 'xxx',
  //   conversationId: 'xxx',
  //   communityId: 'xxx'
  // }
});
```

#### Voice Upload Progress
```typescript
socket.on('voice:progress', (data) => {
  console.log('Voice upload:', data);
  // {
  //   userId: 'xxx',
  //   conversationId: 'xxx',
  //   communityId: 'xxx',
  //   progress: 50
  // }
});
```

---

## Data Models

### Message
```typescript
{
  _id: ObjectId,
  sender: ObjectId (ref: User),
  recipient?: ObjectId (ref: User),
  community?: ObjectId (ref: Community),
  conversation?: ObjectId (ref: Conversation),
  type: 'text' | 'voice' | 'image' | 'file' | 'system',
  content?: string,
  mediaUrl?: string,
  mediaDuration?: number,
  mediaSize?: number,
  mimeType?: string,
  status: 'sent' | 'delivered' | 'read' | 'failed',
  deliveredAt?: Date,
  readAt?: Date,
  isBroadcast: boolean,
  broadcastRecipients?: ObjectId[],
  replyTo?: ObjectId (ref: Message),
  isDeleted: boolean,
  deletedAt?: Date,
  metadata?: Record<string, any>,
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation
```typescript
{
  _id: ObjectId,
  participants: ObjectId[] (ref: User),
  lastMessage?: ObjectId (ref: Message),
  lastMessageAt?: Date,
  unreadCount: Map<string, number>,
  lastReadAt: Map<string, Date>,
  isArchived: boolean,
  archivedBy: ObjectId[],
  isMuted: Map<string, boolean>,
  isBlocked: Map<string, boolean>,
  createdAt: Date,
  updatedAt: Date
}
```

### Community
```typescript
{
  _id: ObjectId,
  name: string,
  description?: string,
  imageUrl?: string,
  createdBy: ObjectId (ref: User),
  admins: ObjectId[] (ref: User),
  members: ObjectId[] (ref: User),
  type: 'public' | 'private' | 'announcement',
  lastMessage?: ObjectId (ref: Message),
  lastMessageAt?: Date,
  lastReadAt: Map<string, Date>,
  bannedUsers: ObjectId[],
  settings: {
    allowMembersToPost?: boolean,
    allowMembersToAddOthers?: boolean,
    maxMembers?: number
  },
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Authentication

All REST endpoints require JWT authentication via Bearer token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Socket.IO connections authenticate on connection:

```typescript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

---

## Examples

### Complete Chat Flow

#### 1. User A sends message to User B
```typescript
// User A's client
socket.emit('send:message', {
  recipient: 'userB_id',
  type: 'text',
  content: 'Hey! How are you?'
});

// User B's client receives
socket.on('message:new', (message) => {
  // Display message in UI
  displayMessage(message);
});
```

#### 2. User B starts typing
```typescript
// User B's client
socket.emit('typing:start', {
  conversationId: 'conversation_id'
});

// User A's client receives
socket.on('typing:status', (data) => {
  if (data.isTyping) {
    showTypingIndicator(data.userId);
  }
});
```

#### 3. User B sends reply
```typescript
// User B's client
socket.emit('send:message', {
  recipient: 'userA_id',
  type: 'text',
  content: 'I\'m good, thanks!',
  replyTo: 'original_message_id'
});

socket.emit('typing:stop', {
  conversationId: 'conversation_id'
});

// User A's client receives
socket.on('typing:status', (data) => {
  if (!data.isTyping) {
    hideTypingIndicator(data.userId);
  }
});

socket.on('message:new', (message) => {
  displayMessage(message);
});
```

#### 4. User A reads the message
```typescript
// User A's client
socket.emit('message:read', {
  messageId: 'message_id',
  conversationId: 'conversation_id'
});

// User B's client receives
socket.on('message:status', (data) => {
  if (data.status === 'read') {
    updateMessageStatus(data.messageId, 'read');
  }
});
```

### Sending Voice Note

```typescript
// 1. Record voice
const mediaRecorder = new MediaRecorder(stream);
const chunks = [];

mediaRecorder.ondataavailable = (e) => {
  chunks.push(e.data);
};

mediaRecorder.onstop = async () => {
  const blob = new Blob(chunks, { type: 'audio/webm' });
  
  // 2. Upload to server
  const formData = new FormData();
  formData.append('file', blob, 'voice.webm');
  
  // Show upload progress
  socket.emit('voice:uploading', {
    recipient: 'userId',
    progress: 0
  });
  
  const xhr = new XMLHttpRequest();
  xhr.upload.onprogress = (e) => {
    const progress = (e.loaded / e.total) * 100;
    socket.emit('voice:uploading', {
      recipient: 'userId',
      progress
    });
  };
  
  xhr.onload = async () => {
    const { url, size, mimeType } = JSON.parse(xhr.responseText);
    
    // 3. Send message with voice URL
    socket.emit('send:message', {
      recipient: 'userId',
      type: 'voice',
      mediaUrl: url,
      mediaDuration: Math.floor(duration),
      mediaSize: size,
      mimeType: mimeType
    });
  };
  
  xhr.open('POST', 'http://localhost:3000/chat/upload');
  xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  xhr.send(formData);
};

mediaRecorder.start();
```

### Creating and Using Community

```typescript
// 1. Admin creates community
const response = await fetch('http://localhost:3000/chat/communities', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Fitness Warriors',
    description: 'Daily motivation and tips',
    type: 'private',
    members: ['user1', 'user2'],
    settings: {
      allowMembersToPost: true
    }
  })
});

const community = await response.json();

// 2. Members automatically join Socket.IO room
// (happens automatically on connection)

// 3. Send message to community
socket.emit('send:message', {
  community: community._id,
  type: 'text',
  content: 'Welcome everyone!'
});

// 4. All members receive
socket.on('message:new', (message) => {
  if (message.community) {
    displayCommunityMessage(message);
  }
});
```

### Broadcast Message (Admin Only)

```typescript
// Admin sends announcement to multiple users
const response = await fetch('http://localhost:3000/chat/broadcast', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    isBroadcast: true,
    broadcastRecipients: ['user1', 'user2', 'user3', 'user4'],
    type: 'text',
    content: 'Important system announcement!'
  })
});

// Each recipient receives individual message
socket.on('message:new', (message) => {
  if (message.isBroadcast) {
    displayBroadcastMessage(message);
  }
});
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Either recipient, community, or broadcast recipients must be provided",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You are not a member of this community",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Community not found",
  "error": "Not Found"
}
```

---

## Rate Limiting (Recommended)

Consider implementing rate limiting for:
- Message sending: 60 messages per minute
- File uploads: 10 uploads per minute
- Community creation: 5 per hour

Example with `@nestjs/throttler`:
```typescript
@Throttle({ default: { limit: 60, ttl: 60000 } })
@Post('messages')
async sendMessage() { ... }
```
