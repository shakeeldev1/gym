# Chat Module - Quick Testing Guide

## 🚀 Start the Server

```bash
cd Server
npm run start:dev
```

Server should start on `http://localhost:3000`

## 📋 Prerequisites

1. MongoDB running and connected
2. User account created (via signup)
3. JWT token obtained (via login)
4. Two user accounts for testing chat

## 🧪 Test Scenarios

### 1. Test One-on-One Chat

#### A. Send Text Message (REST API)
```bash
POST http://localhost:3000/chat/messages
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "recipient": "OTHER_USER_ID",
  "type": "text",
  "content": "Hello! This is a test message."
}
```

**Expected Response:**
```json
{
  "_id": "...",
  "sender": { ... },
  "recipient": { ... },
  "type": "text",
  "content": "Hello! This is a test message.",
  "status": "sent",
  "createdAt": "...",
  ...
}
```

#### B. Get Messages from Conversation
```bash
GET http://localhost:3000/chat/messages?conversationId=CONVERSATION_ID&limit=50
Authorization: Bearer YOUR_TOKEN
```

#### C. Get All Conversations
```bash
GET http://localhost:3000/chat/conversations
Authorization: Bearer YOUR_TOKEN
```

### 2. Test Voice Notes

#### A. Upload Voice File
```bash
POST http://localhost:3000/chat/upload
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

Body:
  file: [select .mp3 or .wav file]
```

**Expected Response:**
```json
{
  "url": "/uploads/chat/file-1234567890.mp3",
  "filename": "file-1234567890.mp3",
  "originalName": "voice-note.mp3",
  "mimeType": "audio/mpeg",
  "size": 102400
}
```

#### B. Send Voice Message
```bash
POST http://localhost:3000/chat/messages
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "recipient": "OTHER_USER_ID",
  "type": "voice",
  "mediaUrl": "/uploads/chat/file-1234567890.mp3",
  "mediaDuration": 30,
  "mediaSize": 102400,
  "mimeType": "audio/mpeg"
}
```

### 3. Test Communities

#### A. Create Community
```bash
POST http://localhost:3000/chat/communities
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Test Community",
  "description": "A test group for chat",
  "type": "private",
  "members": ["USER_ID_1", "USER_ID_2"],
  "settings": {
    "allowMembersToPost": true
  }
}
```

#### B. Send Message to Community
```bash
POST http://localhost:3000/chat/messages
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "community": "COMMUNITY_ID",
  "type": "text",
  "content": "Hello everyone in the community!"
}
```

#### C. Add Members to Community
```bash
POST http://localhost:3000/chat/communities/COMMUNITY_ID/members
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "userIds": ["USER_ID_3", "USER_ID_4"]
}
```

#### D. Get User's Communities
```bash
GET http://localhost:3000/chat/communities
Authorization: Bearer YOUR_TOKEN
```

### 4. Test Broadcast Messages (Admin)

```bash
POST http://localhost:3000/chat/broadcast
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "isBroadcast": true,
  "broadcastRecipients": ["USER_ID_1", "USER_ID_2", "USER_ID_3"],
  "type": "text",
  "content": "Important announcement for all users!"
}
```

### 5. Test Real-time with Socket.IO

#### Open Browser Console (F12) and run:

```javascript
// Connect to Socket.IO
const socket = io('http://localhost:3000', {
  auth: {
    token: 'YOUR_JWT_TOKEN_HERE'
  }
});

// Listen for connection
socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
});

// Listen for new messages
socket.on('message:new', (message) => {
  console.log('📨 New message:', message);
});

// Listen for typing status
socket.on('typing:status', (data) => {
  console.log('⌨️ Typing:', data);
});

// Listen for message status updates
socket.on('message:status', (data) => {
  console.log('✓ Message status:', data);
});

// Send a message
socket.emit('send:message', {
  recipient: 'OTHER_USER_ID',
  type: 'text',
  content: 'Real-time message from browser!'
});

// Start typing
socket.emit('typing:start', {
  conversationId: 'CONVERSATION_ID'
});

// Stop typing after 3 seconds
setTimeout(() => {
  socket.emit('typing:stop', {
    conversationId: 'CONVERSATION_ID'
  });
}, 3000);

// Mark message as read
socket.emit('message:read', {
  messageId: 'MESSAGE_ID',
  conversationId: 'CONVERSATION_ID'
});
```

### 6. Test Read Receipts

#### A. Mark Single Message as Read
```bash
POST http://localhost:3000/chat/messages/read
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "messageId": "MESSAGE_ID"
}
```

#### B. Mark All Messages in Conversation as Read
```bash
POST http://localhost:3000/chat/messages/read
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "conversationId": "CONVERSATION_ID"
}
```

#### C. Get Unread Count
```bash
GET http://localhost:3000/chat/unread-count
Authorization: Bearer YOUR_TOKEN
```

### 7. Test Message Deletion

```bash
DELETE http://localhost:3000/chat/messages/MESSAGE_ID
Authorization: Bearer YOUR_TOKEN
```

### 8. Test Archive/Mute

#### Archive Conversation
```bash
POST http://localhost:3000/chat/conversations/CONVERSATION_ID/archive
Authorization: Bearer YOUR_TOKEN
```

#### Mute Conversation
```bash
POST http://localhost:3000/chat/conversations/CONVERSATION_ID/mute
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "muted": true
}
```

## 🔍 Debugging Tips

### Check Server Logs
Watch the server console for:
- Socket.IO connections: "Client connected: ..."
- WebSocket events: "Received send:message event"
- Errors: Any red error messages

### Check Database
```bash
# MongoDB Shell
use your_database_name

# Check messages
db.messages.find().pretty()

# Check conversations
db.conversations.find().pretty()

# Check communities
db.communities.find().pretty()
```

### Common Issues

#### 1. Socket.IO Connection Failed
**Error:** `connect_error` event fired

**Solutions:**
- Check JWT token is valid
- Verify server is running on correct port
- Check CORS settings in chat.gateway.ts
- Ensure token is passed in auth object

#### 2. File Upload Failed
**Error:** 400 Bad Request or 500 Internal Server Error

**Solutions:**
- Check `uploads/chat` directory exists
- Verify file type is allowed (see chat.controller.ts)
- Check file size is under 50MB
- Ensure multer is properly installed

#### 3. Messages Not Appearing
**Solutions:**
- Check database connection
- Verify user IDs are correct
- Check if user is member of conversation/community
- Check Socket.IO connection status

#### 4. Typing Indicators Not Working
**Solutions:**
- Ensure both users are connected via Socket.IO
- Check conversationId is correct
- Verify typing:start and typing:stop events are emitted
- Check Socket.IO rooms are properly joined

## 📊 Test Checklist

- [ ] Server starts without errors
- [ ] Can send text message via REST API
- [ ] Can receive message via Socket.IO
- [ ] Can upload voice file
- [ ] Can send voice message
- [ ] Can create community
- [ ] Can add members to community
- [ ] Can send message to community
- [ ] Can send broadcast message
- [ ] Typing indicators work
- [ ] Read receipts work
- [ ] Can mark messages as read
- [ ] Can delete message
- [ ] Can archive conversation
- [ ] Can mute conversation
- [ ] Unread count is accurate
- [ ] Socket.IO connects successfully
- [ ] Multiple users can chat simultaneously

## 🎯 Advanced Testing

### Test with Two Browser Windows

1. **Window 1 (User A):**
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'USER_A_TOKEN' }
});

socket.on('connect', () => console.log('User A connected'));
socket.on('message:new', (msg) => console.log('User A received:', msg));
socket.on('typing:status', (data) => console.log('User A sees typing:', data));
```

2. **Window 2 (User B):**
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'USER_B_TOKEN' }
});

socket.on('connect', () => console.log('User B connected'));

// Send message to User A
socket.emit('send:message', {
  recipient: 'USER_A_ID',
  type: 'text',
  content: 'Hi from User B!'
});

// Start typing
socket.emit('typing:start', {
  conversationId: 'CONVERSATION_ID'
});
```

3. **Verify:**
- User A should see "User B is typing..."
- User A should receive the message
- Message status should update to 'delivered'
- When User A reads it, status should update to 'read'

## 📱 Testing with Real Client

If you have a React/Vue/Angular client:

```typescript
// Install socket.io-client
npm install socket.io-client

// Create socket hook
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:3000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [token]);

  return socket;
}

// Use in component
function Chat() {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('message:new', (message) => {
      // Add message to UI
      setMessages(prev => [...prev, message]);
    });

    return () => socket.off('message:new');
  }, [socket]);

  const sendMessage = (text) => {
    socket.emit('send:message', {
      recipient: recipientId,
      type: 'text',
      content: text
    });
  };

  return <div>Chat UI</div>;
}
```

## ✅ Success Criteria

Your chat system is working correctly if:

1. ✅ Messages are delivered in real-time
2. ✅ Both users can see typing indicators
3. ✅ Read receipts update automatically
4. ✅ Voice notes upload and play
5. ✅ Communities show all messages to members
6. ✅ Broadcast messages reach all recipients
7. ✅ Unread counts are accurate
8. ✅ Archive/mute functions work
9. ✅ No errors in server console
10. ✅ No errors in browser console

---

**Ready to test!** Start with the simple REST API tests, then move to Socket.IO real-time features.
