# Admin Dashboard - Chat API Integration Guide

## Overview
Admin dashboard integration for managing all chat operations, broadcasting messages, creating communities, and monitoring conversations.

---

## 🔑 Admin-Only Endpoints

### 1. Broadcast Messages
**Purpose:** Send announcements to multiple users simultaneously

```javascript
POST /chat/broadcast
Authorization: Bearer {admin-token}
Content-Type: application/json

Body:
{
  "isBroadcast": true,
  "broadcastRecipients": ["userId1", "userId2", "userId3"],
  "type": "text",
  "content": "System maintenance scheduled for tonight at 10 PM"
}
```

**Use Case:** System announcements, promotions, important updates

**Frontend Component:** Broadcast Message Form
```jsx
// Example React Component
function BroadcastMessage() {
  const [recipients, setRecipients] = useState([]);
  const [message, setMessage] = useState('');

  const sendBroadcast = async () => {
    await fetch('/chat/broadcast', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isBroadcast: true,
        broadcastRecipients: recipients,
        type: 'text',
        content: message
      })
    });
  };

  return (
    <div>
      <h3>Send Broadcast Message</h3>
      <UserSelector onChange={setRecipients} />
      <textarea value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={sendBroadcast}>Send to {recipients.length} users</button>
    </div>
  );
}
```

---

### 2. Community Management

#### Create Community
```javascript
POST /chat/communities
Authorization: Bearer {admin-token}

Body:
{
  "name": "Premium Members Group",
  "description": "Exclusive community for premium members",
  "type": "private",
  "members": ["userId1", "userId2"],
  "admins": ["coachId1"],
  "settings": {
    "allowMembersToPost": true,
    "allowMembersToAddOthers": false,
    "maxMembers": 500
  }
}
```

**Use Case:** Create groups for specific user segments (premium users, specific programs, etc.)

#### Update Community Settings
```javascript
PUT /chat/communities/:communityId
Authorization: Bearer {admin-token}

Body:
{
  "name": "Updated Name",
  "settings": {
    "allowMembersToPost": false  // Make it announcement-only
  }
}
```

#### Delete/Archive Community
```javascript
DELETE /chat/communities/:communityId
Authorization: Bearer {admin-token}
```

**Frontend Component:** Community Manager
```jsx
function CommunityManager() {
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    // Fetch all communities (admin can see all)
    fetch('/chat/communities', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setCommunities);
  }, []);

  const createCommunity = async (data) => {
    await fetch('/chat/communities', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  };

  return (
    <div>
      <h3>Communities</h3>
      <CreateCommunityForm onSubmit={createCommunity} />
      <CommunityList communities={communities} />
    </div>
  );
}
```

---

### 3. Member Management

#### Add Members to Community
```javascript
POST /chat/communities/:communityId/members
Authorization: Bearer {admin-token}

Body:
{
  "userIds": ["user1", "user2", "user3"]
}
```

#### Remove Member
```javascript
DELETE /chat/communities/:communityId/members/:userId
Authorization: Bearer {admin-token}
```

#### Promote User to Admin
```javascript
POST /chat/communities/:communityId/admins/:userId
Authorization: Bearer {admin-token}
```

**Frontend Component:** Member Management
```jsx
function MemberManagement({ communityId }) {
  const addMembers = async (userIds) => {
    await fetch(`/chat/communities/${communityId}/members`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userIds })
    });
  };

  const removeMember = async (userId) => {
    await fetch(`/chat/communities/${communityId}/members/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  };

  return (
    <div>
      <h4>Manage Members</h4>
      <AddMembersButton onAdd={addMembers} />
      <MemberList onRemove={removeMember} />
    </div>
  );
}
```

---

### 4. Admin → User Direct Messaging

#### Send Message to User
```javascript
POST /chat/messages
Authorization: Bearer {admin-token}

Body:
{
  "recipient": "userId",
  "type": "text",
  "content": "Hi! This is the admin team. How can we help you today?"
}
```

#### Get All Admin Conversations
```javascript
GET /chat/conversations
Authorization: Bearer {admin-token}
```

**Frontend Component:** Admin Chat Interface
```jsx
function AdminChat() {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    // Fetch all conversations
    fetch('/chat/conversations', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setConversations);

    // Listen for new messages
    socket?.on('message:new', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
  }, [socket]);

  const sendMessage = (text) => {
    socket.emit('send:message', {
      recipient: activeChat.userId,
      type: 'text',
      content: text
    });
  };

  return (
    <div className="admin-chat">
      <ConversationList 
        conversations={conversations}
        onSelect={setActiveChat}
      />
      <ChatWindow 
        messages={messages}
        onSend={sendMessage}
      />
    </div>
  );
}
```

---

### 5. Monitoring & Analytics

#### Get Total Unread Messages
```javascript
GET /chat/unread-count
Authorization: Bearer {admin-token}

Response:
{
  "unreadCount": 45
}
```

#### Get Community Statistics
```javascript
GET /chat/communities/:communityId
Authorization: Bearer {admin-token}

Response:
{
  "_id": "...",
  "name": "Premium Group",
  "members": [...],  // Array of all members
  "lastMessage": {...},
  "lastMessageAt": "2026-01-13T..."
}
```

**Frontend Component:** Chat Analytics Dashboard
```jsx
function ChatAnalytics() {
  const [stats, setStats] = useState({
    totalConversations: 0,
    unreadMessages: 0,
    totalCommunities: 0,
    activeUsers: 0
  });

  useEffect(() => {
    Promise.all([
      fetch('/chat/conversations'),
      fetch('/chat/unread-count'),
      fetch('/chat/communities')
    ])
    .then(([convRes, unreadRes, commRes]) => 
      Promise.all([convRes.json(), unreadRes.json(), commRes.json()])
    )
    .then(([conversations, unread, communities]) => {
      setStats({
        totalConversations: conversations.length,
        unreadMessages: unread.unreadCount,
        totalCommunities: communities.length,
        activeUsers: new Set(conversations.flatMap(c => c.participants)).size
      });
    });
  }, []);

  return (
    <div className="chat-analytics">
      <StatCard title="Conversations" value={stats.totalConversations} />
      <StatCard title="Unread" value={stats.unreadMessages} />
      <StatCard title="Communities" value={stats.totalCommunities} />
      <StatCard title="Active Users" value={stats.activeUsers} />
    </div>
  );
}
```

---

## 📱 Admin Dashboard Layout Recommendations

### Sidebar Menu
```
Chat Management
├── 📨 Messages (Inbox)
├── 📢 Broadcast
├── 👥 Communities
├── 📊 Analytics
└── ⚙️ Settings
```

### Main Dashboard Sections

#### 1. Messages Tab
- List of all user conversations
- Unread message indicators
- Quick reply functionality
- Search users
- Filter by date/status

#### 2. Broadcast Tab
- Recipient selector (all users, specific users, user segments)
- Message composer
- Schedule broadcast
- Broadcast history
- Delivery statistics

#### 3. Communities Tab
- Create new community
- List of all communities
- Member management
- Community settings
- Activity monitoring

#### 4. Analytics Tab
- Total messages sent/received
- Active conversations
- Response time metrics
- User engagement stats
- Community participation

---

## 🎨 UI Components Needed

### 1. Conversation List Component
```jsx
<ConversationList 
  conversations={conversations}
  onSelect={handleSelectConversation}
  showUnreadCount={true}
  enableSearch={true}
/>
```

### 2. Chat Window Component
```jsx
<ChatWindow
  messages={messages}
  currentUser={adminUser}
  onSendMessage={handleSend}
  onSendVoiceNote={handleVoiceNote}
  showTypingIndicator={true}
/>
```

### 3. Broadcast Composer
```jsx
<BroadcastComposer
  onSelectRecipients={handleSelectRecipients}
  onSend={handleSendBroadcast}
  allowScheduling={true}
  showPreview={true}
/>
```

### 4. Community Manager
```jsx
<CommunityManager
  communities={communities}
  onCreate={handleCreateCommunity}
  onUpdate={handleUpdateCommunity}
  onDelete={handleDeleteCommunity}
  showMemberManagement={true}
/>
```

---

## 🔌 Socket.IO Integration for Admin

```javascript
import { io } from 'socket.io-client';

// Connect as admin
const socket = io('http://localhost:3000', {
  auth: {
    token: adminToken
  }
});

// Listen for new messages from any user
socket.on('message:new', (message) => {
  // Update UI with new message
  showNotification(`New message from ${message.sender.name}`);
  updateConversationList(message);
});

// Listen for typing indicators
socket.on('typing:status', (data) => {
  // Show "User is typing..." in conversation
  updateTypingIndicator(data);
});

// Send message
function sendAdminMessage(recipientId, text) {
  socket.emit('send:message', {
    recipient: recipientId,
    type: 'text',
    content: text
  });
}

// Send broadcast
function sendBroadcast(recipientIds, text) {
  socket.emit('send:message', {
    isBroadcast: true,
    broadcastRecipients: recipientIds,
    type: 'text',
    content: text
  });
}
```

---

## 📋 Complete Admin Endpoints List

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/chat/broadcast` | POST | Send broadcast message |
| `/chat/messages` | POST | Send message to user |
| `/chat/messages` | GET | Get messages |
| `/chat/conversations` | GET | Get all conversations |
| `/chat/unread-count` | GET | Get unread count |
| `/chat/communities` | POST | Create community |
| `/chat/communities` | GET | Get all communities |
| `/chat/communities/:id` | PUT | Update community |
| `/chat/communities/:id` | DELETE | Delete community |
| `/chat/communities/:id/members` | POST | Add members |
| `/chat/communities/:id/members/:userId` | DELETE | Remove member |
| `/chat/communities/:id/admins/:userId` | POST | Promote to admin |
| `/chat/upload` | POST | Upload media |

---

## 🚀 Implementation Priority

### Phase 1 (Essential)
1. ✅ Admin message inbox
2. ✅ Send message to users
3. ✅ View all conversations
4. ✅ Unread count

### Phase 2 (Important)
5. ✅ Broadcast messaging
6. ✅ Create communities
7. ✅ Community member management

### Phase 3 (Enhanced)
8. ✅ Voice note support
9. ✅ Analytics dashboard
10. ✅ Advanced filters

---

## 🔒 Security Considerations

- ✅ All endpoints require admin authentication
- ✅ Verify admin role in AuthGuard
- ✅ Rate limiting for broadcast messages
- ✅ Audit log for admin actions
- ✅ Input validation on all endpoints

---

## 📱 Mobile Admin App Support

All endpoints work with mobile apps. Use the same REST API and Socket.IO connection with admin token.

```javascript
// React Native Example
import io from 'socket.io-client';

const socket = io('https://your-api.com', {
  auth: { token: adminToken }
});
```
