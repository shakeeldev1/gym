# Coach Dashboard - Chat API Integration Guide

## Overview
Coach dashboard integration for managing assigned users, group coaching, and community engagement.

---

## 🎯 Coach-Specific Endpoints

### 1. Coach → User Direct Messaging

#### Send Message to Assigned User
```javascript
POST /chat/messages
Authorization: Bearer {coach-token}
Content-Type: application/json

Body:
{
  "recipient": "userId",
  "type": "text",
  "content": "Great workout today! Keep up the excellent progress 💪"
}
```

**Use Case:** Daily check-ins, motivation, feedback on user progress

**Frontend Component:**
```jsx
function CoachChat() {
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    // Fetch assigned users
    fetch('/user/assigned-users', {  // Assuming you have this endpoint
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setAssignedUsers);

    // Listen for new messages
    socket?.on('message:new', (msg) => {
      setMessages(prev => [...prev, msg]);
      // Show notification if from assigned user
      if (assignedUsers.find(u => u._id === msg.sender._id)) {
        showNotification(`New message from ${msg.sender.name}`);
      }
    });
  }, [socket]);

  const sendMessage = (text) => {
    socket.emit('send:message', {
      recipient: activeUser._id,
      type: 'text',
      content: text
    });
  };

  return (
    <div className="coach-chat">
      <UserList 
        users={assignedUsers}
        onSelect={setActiveUser}
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

### 2. Voice Notes for Coaching

#### Upload and Send Voice Coaching
```javascript
// Step 1: Upload voice note
POST /chat/upload
Authorization: Bearer {coach-token}
Content-Type: multipart/form-data

Body (form-data):
  file: [voice recording]

Response:
{
  "url": "/uploads/chat/voice-123.mp3",
  "mimeType": "audio/mpeg",
  "size": 512000
}

// Step 2: Send voice message
POST /chat/messages
Authorization: Bearer {coach-token}

Body:
{
  "recipient": "userId",
  "type": "voice",
  "mediaUrl": "/uploads/chat/voice-123.mp3",
  "mediaDuration": 45,
  "mediaSize": 512000,
  "mimeType": "audio/mpeg"
}
```

**Use Case:** Personalized coaching feedback, technique corrections, motivation

**Frontend Component:**
```jsx
function VoiceMessage() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const socket = useSocket();

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      setAudioBlob(blob);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const sendVoiceNote = async () => {
    // Upload
    const formData = new FormData();
    formData.append('file', audioBlob, 'coaching-note.webm');
    
    const uploadRes = await fetch('/chat/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    const { url, size, mimeType } = await uploadRes.json();
    
    // Send via socket
    socket.emit('send:message', {
      recipient: activeUser._id,
      type: 'voice',
      mediaUrl: url,
      mediaDuration: getDuration(audioBlob),
      mediaSize: size,
      mimeType: mimeType
    });
  };

  return (
    <div>
      <button onClick={startRecording}>🎤 Record Voice Note</button>
      {audioBlob && <button onClick={sendVoiceNote}>Send</button>}
    </div>
  );
}
```

---

### 3. Coaching Communities

#### Create Coaching Group
```javascript
POST /chat/communities
Authorization: Bearer {coach-token}

Body:
{
  "name": "Morning Workout Squad",
  "description": "Daily 6 AM workout group",
  "type": "private",
  "members": ["user1", "user2", "user3", "user4"],
  "settings": {
    "allowMembersToPost": true,
    "allowMembersToAddOthers": false
  }
}
```

**Use Case:** Group training, accountability groups, challenge groups

#### Send Message to Group
```javascript
POST /chat/messages
Authorization: Bearer {coach-token}

Body:
{
  "community": "communityId",
  "type": "text",
  "content": "Great session today everyone! Tomorrow we're doing HIIT 🔥"
}
```

**Frontend Component:**
```jsx
function CoachingGroups() {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);

  const createGroup = async (data) => {
    const res = await fetch('/chat/communities', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        type: 'private',
        members: data.selectedUsers,
        settings: {
          allowMembersToPost: true
        }
      })
    });
    
    const group = await res.json();
    setGroups([...groups, group]);
  };

  const sendGroupMessage = (text) => {
    socket.emit('send:message', {
      community: activeGroup._id,
      type: 'text',
      content: text
    });
  };

  return (
    <div className="coaching-groups">
      <CreateGroupButton onCreate={createGroup} />
      <GroupList groups={groups} onSelect={setActiveGroup} />
      <GroupChat 
        group={activeGroup}
        onSend={sendGroupMessage}
      />
    </div>
  );
}
```

---

### 4. User Conversations

#### Get All User Conversations
```javascript
GET /chat/conversations
Authorization: Bearer {coach-token}

Response:
[
  {
    "_id": "conversationId",
    "participants": [
      { "_id": "coachId", "name": "Coach John" },
      { "_id": "userId", "name": "User Sarah" }
    ],
    "lastMessage": {
      "content": "Thanks for the workout plan!",
      "createdAt": "2026-01-13T10:30:00Z"
    },
    "unreadCount": {
      "coachId": 2
    }
  }
]
```

**Frontend Component:**
```jsx
function UserConversations() {
  const [conversations, setConversations] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, archived

  useEffect(() => {
    fetch('/chat/conversations', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(convs => {
      // Filter and sort
      let filtered = convs;
      if (filter === 'unread') {
        filtered = convs.filter(c => c.unreadCount[coachId] > 0);
      }
      setConversations(filtered);
    });
  }, [filter]);

  return (
    <div>
      <FilterButtons value={filter} onChange={setFilter} />
      <ConversationList 
        conversations={conversations}
        showUnread={true}
      />
    </div>
  );
}
```

---

### 5. Quick Actions & Templates

#### Send Motivational Message
```javascript
// Pre-defined message templates for coaches
const templates = {
  dailyCheckIn: "Good morning! How are you feeling today? Ready for your workout?",
  congratulations: "Congratulations on completing today's workout! 🎉",
  restDay: "Today is your rest day. Take time to recover and prepare for tomorrow!",
  missedWorkout: "I noticed you missed today's session. Everything okay?",
  weeklyReview: "Let's review your progress this week. Great job on completing X workouts!"
};

// Send template message
POST /chat/messages
Body:
{
  "recipient": "userId",
  "type": "text",
  "content": templates.dailyCheckIn
}
```

**Frontend Component:**
```jsx
function QuickActions({ userId }) {
  const templates = [
    { id: 1, label: '👋 Daily Check-in', message: 'Good morning! How are you feeling today?' },
    { id: 2, label: '🎉 Congratulations', message: 'Great job on completing your workout!' },
    { id: 3, label: '💪 Motivation', message: 'You\'re doing amazing! Keep pushing!' }
  ];

  const sendTemplate = (template) => {
    socket.emit('send:message', {
      recipient: userId,
      type: 'text',
      content: template.message
    });
  };

  return (
    <div className="quick-actions">
      {templates.map(t => (
        <button key={t.id} onClick={() => sendTemplate(t)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
```

---

### 6. Unread Messages & Notifications

#### Get Unread Count
```javascript
GET /chat/unread-count
Authorization: Bearer {coach-token}

Response:
{
  "unreadCount": 5
}
```

#### Mark Conversation as Read
```javascript
POST /chat/messages/read
Authorization: Bearer {coach-token}

Body:
{
  "conversationId": "conversationId"
}
```

**Frontend Component:**
```jsx
function UnreadBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket();

  useEffect(() => {
    // Initial count
    fetch('/chat/unread-count', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setUnreadCount(data.unreadCount));

    // Listen for new messages
    socket?.on('message:new', () => {
      setUnreadCount(prev => prev + 1);
    });

    // Listen for read messages
    socket?.on('message:status', (data) => {
      if (data.status === 'read') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    });
  }, [socket]);

  return (
    <div className="unread-badge">
      {unreadCount > 0 && <span>{unreadCount}</span>}
    </div>
  );
}
```

---

## 📱 Coach Dashboard Layout

### Sidebar Menu
```
Messages
├── 💬 Chats (with assigned users)
├── 👥 Groups (coaching groups)
├── 📋 Quick Actions
└── 📊 Activity
```

### Main Sections

#### 1. Chats Tab
- List of conversations with assigned users
- Unread indicators
- Search functionality
- Quick message templates
- Voice note recording

#### 2. Groups Tab
- Create new coaching group
- List of active groups
- Group message feed
- Member list
- Group settings

#### 3. Quick Actions Tab
- Pre-defined message templates
- Bulk messaging (to all assigned users)
- Scheduled messages
- Automated check-ins

---

## 🎨 Coach UI Components

### 1. User Chat List
```jsx
<UserChatList
  users={assignedUsers}
  showOnlineStatus={true}
  showUnreadCount={true}
  enableSearch={true}
  onSelectUser={handleSelectUser}
/>
```

### 2. Message Composer with Templates
```jsx
<MessageComposer
  onSend={handleSend}
  showTemplates={true}
  showVoiceRecording={true}
  showQuickReplies={true}
  placeholder="Message your client..."
/>
```

### 3. Group Chat Interface
```jsx
<GroupChat
  group={activeGroup}
  messages={messages}
  onSendMessage={handleSendGroupMessage}
  showMemberList={true}
/>
```

---

## 🔌 Socket.IO for Coaches

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: coachToken }
});

// Listen for messages from assigned users
socket.on('message:new', (message) => {
  // Check if from assigned user
  if (isAssignedUser(message.sender._id)) {
    showNotification(`${message.sender.name} sent a message`);
    updateChatUI(message);
  }
});

// Send typing indicator
function notifyTyping(userId) {
  socket.emit('typing:start', {
    conversationId: getConversationId(userId)
  });
}

// Send message
function sendCoachMessage(userId, text) {
  socket.emit('send:message', {
    recipient: userId,
    type: 'text',
    content: text
  });
}
```

---

## 📋 Complete Coach Endpoints List

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/chat/messages` | POST | Send message to user |
| `/chat/messages` | GET | Get messages |
| `/chat/conversations` | GET | Get all conversations |
| `/chat/unread-count` | GET | Get unread count |
| `/chat/messages/read` | POST | Mark as read |
| `/chat/communities` | POST | Create coaching group |
| `/chat/communities` | GET | Get coach's groups |
| `/chat/communities/:id` | PUT | Update group |
| `/chat/communities/:id/members` | POST | Add members to group |
| `/chat/upload` | POST | Upload voice notes |

---

## 🚀 Implementation Checklist

### Phase 1 (Essential)
- [ ] Chat with assigned users
- [ ] Send text messages
- [ ] Receive messages from users
- [ ] Unread message count
- [ ] Mark messages as read

### Phase 2 (Important)
- [ ] Voice note recording and sending
- [ ] Create coaching groups
- [ ] Group messaging
- [ ] Message templates
- [ ] Quick replies

### Phase 3 (Enhanced)
- [ ] Scheduled messages
- [ ] Bulk messaging
- [ ] Analytics (response time, engagement)
- [ ] Message search
- [ ] File sharing

---

## 💡 Coach Best Practices

### Recommended Features

1. **Daily Check-ins**
   - Automated morning message to assigned users
   - Quick template: "How are you feeling today?"

2. **Progress Celebrations**
   - Trigger messages when user completes milestones
   - Pre-written congratulations templates

3. **Accountability**
   - Automated reminders for missed workouts
   - Follow-up questions about progress

4. **Group Motivation**
   - Weekly group challenges
   - Shared progress updates
   - Community encouragement

### Message Guidelines for Coaches

✅ Do:
- Be encouraging and positive
- Respond within 24 hours
- Use voice notes for detailed feedback
- Create groups for community building
- Use templates for efficiency

❌ Don't:
- Send generic copy-paste messages
- Ignore user questions
- Overshare personal information
- Spam users with too many messages

---

## 📱 Mobile Coach App Support

All features work on mobile apps using the same APIs.

```javascript
// React Native Example
import { io } from 'socket.io-client';

const socket = io('https://your-api.com', {
  auth: { token: coachToken }
});

// Voice recording with React Native
import { Audio } from 'expo-av';

const recordVoiceNote = async () => {
  const { recording } = await Audio.Recording.createAsync(
    Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
  );
  // ... rest of recording logic
};
```
