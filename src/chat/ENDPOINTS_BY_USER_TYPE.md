# Chat Module - Endpoint Summary by User Type

## 🎯 Quick Reference Guide

This document categorizes all chat endpoints by user type (Admin, Coach, User) for easy integration.

---

## 👑 ADMIN DASHBOARD ENDPOINTS

### Broadcasting
```
✅ POST   /chat/broadcast                    Send broadcast to multiple users
```

### Community Management
```
✅ POST   /chat/communities                  Create community
✅ GET    /chat/communities                  Get all communities (admin sees all)
✅ GET    /chat/communities/:id              Get community details
✅ PUT    /chat/communities/:id              Update community
✅ DELETE /chat/communities/:id              Delete community
✅ POST   /chat/communities/:id/members      Add members to community
✅ DELETE /chat/communities/:id/members/:id  Remove member
✅ POST   /chat/communities/:id/admins/:id   Promote to admin
```

### Messaging & Conversations
```
✅ POST   /chat/messages                     Send message to any user
✅ GET    /chat/messages                     Get messages (all conversations)
✅ GET    /chat/conversations                Get all conversations (admin sees all)
✅ GET    /chat/unread-count                 Get admin's unread count
✅ POST   /chat/messages/read                Mark as read
✅ DELETE /chat/messages/:id                 Delete message
```

### Media Upload
```
✅ POST   /chat/upload                       Upload voice notes/media
```

**Admin-Specific Features:**
- Can broadcast to multiple users
- Can create/delete communities
- Can manage all community members
- Can see all conversations
- Can send messages to any user

---

## 🏋️ COACH DASHBOARD ENDPOINTS

### Direct Messaging
```
✅ POST   /chat/messages                     Send message to assigned users
✅ GET    /chat/messages                     Get messages from conversations
✅ GET    /chat/conversations                Get coach's conversations
✅ POST   /chat/messages/read                Mark messages as read
✅ DELETE /chat/messages/:id                 Delete own messages
```

### Coaching Groups
```
✅ POST   /chat/communities                  Create coaching group
✅ GET    /chat/communities                  Get coach's communities
✅ GET    /chat/communities/:id              Get community details
✅ PUT    /chat/communities/:id              Update group (if admin)
✅ POST   /chat/communities/:id/members      Add members to group
```

### Voice & Media
```
✅ POST   /chat/upload                       Upload voice coaching notes
```

### Analytics
```
✅ GET    /chat/unread-count                 Get unread message count
✅ GET    /chat/communities/:id/unread-count Get community unread count
```

**Coach-Specific Features:**
- Can message assigned users
- Can create coaching groups
- Can send voice coaching notes
- Can manage their own groups
- Can see only their conversations

---

## 📱 USER MOBILE APP ENDPOINTS

### Basic Messaging
```
✅ POST   /chat/messages                     Send message to coach/admin
✅ GET    /chat/messages                     Get message history
✅ GET    /chat/conversations                Get user's conversations
✅ POST   /chat/messages/read                Mark messages as read
✅ DELETE /chat/messages/:id                 Delete own messages
✅ GET    /chat/unread-count                 Get unread count
```

### Communities
```
✅ GET    /chat/communities                  Get joined communities
✅ GET    /chat/communities/:id              Get community details
✅ POST   /chat/messages                     Send message to community
✅ POST   /chat/communities/:id/leave        Leave community
✅ GET    /chat/communities/:id/unread-count Get community unread count
```

### Media
```
✅ POST   /chat/upload                       Upload voice notes/photos
```

**User-Specific Features:**
- Can chat with assigned coach/admin
- Can send voice notes
- Can participate in communities
- Can receive broadcast messages
- Can see only their own conversations

---

## 🔌 SOCKET.IO EVENTS

### Client → Server (All User Types)
```javascript
send:message        // Send real-time message
typing:start        // User started typing
typing:stop         // User stopped typing
message:read        // Mark message as read
message:delete      // Delete message
voice:uploading     // Voice upload progress (optional)
```

### Server → Client (All User Types)
```javascript
message:new         // New message received
message:status      // Message status update (delivered/read)
typing:status       // Typing indicator
message:deleted     // Message was deleted
voice:progress      // Voice upload progress (optional)
```

---

## 📊 ENDPOINT COMPARISON TABLE

| Endpoint | Admin | Coach | User | Description |
|----------|-------|-------|------|-------------|
| `POST /chat/messages` | ✅ | ✅ | ✅ | Send message |
| `POST /chat/broadcast` | ✅ | ❌ | ❌ | Broadcast message |
| `GET /chat/conversations` | ✅ | ✅ | ✅ | Get conversations |
| `POST /chat/communities` | ✅ | ✅ | ❌ | Create community |
| `DELETE /chat/communities/:id` | ✅ | ✅* | ❌ | Delete community |
| `POST /chat/communities/:id/members` | ✅ | ✅* | ❌ | Add members |
| `DELETE /chat/communities/:id/members/:id` | ✅ | ✅* | ❌ | Remove member |
| `POST /chat/communities/:id/admins/:id` | ✅ | ❌ | ❌ | Promote admin |
| `POST /chat/communities/:id/leave` | ✅ | ✅ | ✅ | Leave community |
| `POST /chat/upload` | ✅ | ✅ | ✅ | Upload media |

*Coach can only manage their own communities

---

## 🎯 INTEGRATION PRIORITY BY USER TYPE

### Admin Dashboard - Priority Order
1. **HIGH PRIORITY**
   - View all conversations
   - Send messages to users
   - Unread count
   - Mark as read

2. **MEDIUM PRIORITY**
   - Broadcast messaging
   - Create communities
   - Community management
   - Voice notes

3. **LOW PRIORITY**
   - Analytics
   - Bulk operations
   - Scheduled messages

### Coach Dashboard - Priority Order
1. **HIGH PRIORITY**
   - Chat with assigned users
   - Send/receive messages
   - Unread count
   - Message templates

2. **MEDIUM PRIORITY**
   - Voice coaching notes
   - Create coaching groups
   - Group messaging

3. **LOW PRIORITY**
   - Analytics
   - Scheduled check-ins
   - Bulk messaging

### User Mobile App - Priority Order
1. **HIGH PRIORITY**
   - Chat with coach/admin
   - Send/receive messages
   - Unread badge
   - Real-time updates

2. **MEDIUM PRIORITY**
   - Voice notes
   - Join communities
   - Community chat

3. **LOW PRIORITY**
   - Media sharing (images)
   - Message search
   - Advanced features

---

## 📖 DETAILED INTEGRATION GUIDES

For detailed implementation with code examples:

1. **Admin Dashboard** → See [ADMIN_DASHBOARD_INTEGRATION.md](./ADMIN_DASHBOARD_INTEGRATION.md)
2. **Coach Dashboard** → See [COACH_DASHBOARD_INTEGRATION.md](./COACH_DASHBOARD_INTEGRATION.md)
3. **User Mobile App** → See [USER_APP_INTEGRATION.md](./USER_APP_INTEGRATION.md)

For complete API reference:
- **API Documentation** → See [API_REFERENCE.md](./API_REFERENCE.md)

For testing:
- **Testing Guide** → See [TESTING_GUIDE.md](./TESTING_GUIDE.md)

---

## 🚀 QUICK START

### Admin Dashboard
```javascript
// 1. Send broadcast
POST /chat/broadcast
Body: { 
  isBroadcast: true,
  broadcastRecipients: ["user1", "user2"],
  type: "text",
  content: "Important announcement!"
}

// 2. Create community
POST /chat/communities
Body: {
  name: "Premium Members",
  type: "private",
  members: ["user1", "user2"]
}

// 3. Get all conversations
GET /chat/conversations
```

### Coach Dashboard
```javascript
// 1. Message assigned user
POST /chat/messages
Body: {
  recipient: "userId",
  type: "text",
  content: "Great workout today!"
}

// 2. Create coaching group
POST /chat/communities
Body: {
  name: "Morning Warriors",
  type: "private",
  members: ["user1", "user2", "user3"]
}

// 3. Send voice note
// First upload
POST /chat/upload
Body: FormData with audio file

// Then send
POST /chat/messages
Body: {
  recipient: "userId",
  type: "voice",
  mediaUrl: "/uploads/chat/voice.mp3",
  mediaDuration: 30
}
```

### User Mobile App
```javascript
// 1. Get conversations
GET /chat/conversations

// 2. Send message to coach
POST /chat/messages
Body: {
  recipient: "coachId",
  type: "text",
  content: "Hi coach! Question about my plan."
}

// 3. Socket.IO connection
const socket = io('https://api.com', {
  auth: { token: userToken }
});

socket.on('message:new', (message) => {
  // Handle new message
});

socket.emit('send:message', {
  recipient: 'coachId',
  type: 'text',
  content: 'Hello!'
});
```

---

## 🔐 AUTHENTICATION

All endpoints require JWT authentication:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

Socket.IO authentication:
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

---

## 📝 COMMON REQUEST/RESPONSE EXAMPLES

### Send Text Message
**Request:**
```json
POST /chat/messages
{
  "recipient": "userId",
  "type": "text",
  "content": "Hello!"
}
```

**Response:**
```json
{
  "_id": "msg123",
  "sender": { "_id": "senderId", "name": "John" },
  "recipient": { "_id": "userId", "name": "Jane" },
  "type": "text",
  "content": "Hello!",
  "status": "sent",
  "createdAt": "2026-01-13T10:00:00Z"
}
```

### Send Voice Note
**Request:**
```json
POST /chat/messages
{
  "recipient": "userId",
  "type": "voice",
  "mediaUrl": "/uploads/chat/voice.mp3",
  "mediaDuration": 30,
  "mediaSize": 256000,
  "mimeType": "audio/mpeg"
}
```

### Get Conversations
**Request:**
```
GET /chat/conversations
```

**Response:**
```json
[
  {
    "_id": "conv1",
    "participants": [
      { "_id": "user1", "name": "John" },
      { "_id": "user2", "name": "Jane" }
    ],
    "lastMessage": {
      "content": "See you tomorrow!",
      "createdAt": "2026-01-13T10:30:00Z"
    },
    "unreadCount": { "user1": 2 },
    "lastMessageAt": "2026-01-13T10:30:00Z"
  }
]
```

---

## ⚡ PERFORMANCE TIPS

1. **Pagination**
   - Use `limit` and `skip` query parameters
   - Load 50 messages at a time
   - Implement infinite scroll

2. **Socket.IO**
   - Maintain single connection per user
   - Reconnect on connection loss
   - Buffer messages during offline

3. **Caching**
   - Cache conversations locally
   - Cache user profiles
   - Update cache on real-time events

4. **Media**
   - Compress audio before upload
   - Use progressive upload for large files
   - Show upload progress

---

## 🆘 TROUBLESHOOTING

### Socket.IO Won't Connect
- Check token is valid
- Verify CORS settings
- Check network connectivity

### Messages Not Delivering
- Verify user IDs are correct
- Check database connection
- Verify Socket.IO rooms

### Uploads Failing
- Check file size (max 50MB)
- Verify file type is allowed
- Check uploads directory exists

---

## 📚 ADDITIONAL RESOURCES

- **Setup Guide**: [CHAT_MODULE_GUIDE.md](./CHAT_MODULE_GUIDE.md)
- **Testing**: [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **API Reference**: [API_REFERENCE.md](./API_REFERENCE.md)
- **Implementation Summary**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

**Ready to integrate! 🚀**
