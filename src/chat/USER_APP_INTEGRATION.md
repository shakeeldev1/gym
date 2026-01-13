# User Mobile App - Chat API Integration Guide

## Overview
Complete chat integration for the mobile app from a user's perspective. Users can chat with admin/coaches, join communities, send voice notes, and receive broadcast messages.

---

## 📱 User App Endpoints

### 1. Chat with Admin/Coach

#### Send Message to Admin or Coach
```javascript
POST /chat/messages
Authorization: Bearer {user-token}
Content-Type: application/json

Body:
{
  "recipient": "adminId",  // or coachId
  "type": "text",
  "content": "Hi! I have a question about my workout plan."
}
```

**Use Case:** Ask questions, request help, report issues

**React Native Component:**
```jsx
import { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList } from 'react-native';
import { io } from 'socket.io-client';

function ChatWithCoach({ coachId }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('https://your-api.com', {
      auth: { token: userToken }
    });

    newSocket.on('message:new', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const sendMessage = () => {
    socket.emit('send:message', {
      recipient: coachId,
      type: 'text',
      content: message
    });
    setMessage('');
  };

  return (
    <View>
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} />}
      />
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Type a message..."
      />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
}
```

---

### 2. Send Voice Notes

#### Upload and Send Voice Message
```javascript
// Step 1: Upload voice recording
POST /chat/upload
Authorization: Bearer {user-token}
Content-Type: multipart/form-data

Body:
  file: [audio file]

Response:
{
  "url": "/uploads/chat/voice-456.mp3",
  "filename": "voice-456.mp3",
  "mimeType": "audio/mpeg",
  "size": 256000
}

// Step 2: Send voice message
POST /chat/messages
Authorization: Bearer {user-token}

Body:
{
  "recipient": "coachId",
  "type": "voice",
  "mediaUrl": "/uploads/chat/voice-456.mp3",
  "mediaDuration": 30,
  "mediaSize": 256000,
  "mimeType": "audio/mpeg"
}
```

**Use Case:** Quick questions, feedback on form, motivation check-ins

**React Native Component:**
```jsx
import { Audio } from 'expo-av';
import { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';

function VoiceRecorder({ recipientId, onSent }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    setRecording(recording);
    setIsRecording(true);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    
    // Upload
    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      type: 'audio/m4a',
      name: 'voice-note.m4a'
    });

    const uploadRes = await fetch('https://api.com/chat/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const { url, size, mimeType } = await uploadRes.json();

    // Send message
    socket.emit('send:message', {
      recipient: recipientId,
      type: 'voice',
      mediaUrl: url,
      mediaDuration: Math.floor(recording._finalDurationMillis / 1000),
      mediaSize: size,
      mimeType: mimeType
    });

    onSent?.();
  };

  return (
    <TouchableOpacity
      onPressIn={startRecording}
      onPressOut={stopRecording}
    >
      <Text>{isRecording ? '🔴 Recording...' : '🎤 Hold to record'}</Text>
    </TouchableOpacity>
  );
}
```

---

### 3. View Conversations

#### Get All User Conversations
```javascript
GET /chat/conversations
Authorization: Bearer {user-token}

Response:
[
  {
    "_id": "conv1",
    "participants": [
      { "_id": "userId", "name": "You" },
      { "_id": "coachId", "name": "Coach Mike", "role": "coach" }
    ],
    "lastMessage": {
      "content": "Great workout today!",
      "sender": { "name": "Coach Mike" },
      "createdAt": "2026-01-13T..."
    },
    "unreadCount": { "userId": 2 },
    "lastMessageAt": "2026-01-13T..."
  }
]
```

**React Native Component:**
```jsx
import { FlatList, TouchableOpacity, View, Text } from 'react-native';

function ConversationsList({ navigation }) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    fetch('https://api.com/chat/conversations', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setConversations);
  }, []);

  const renderConversation = ({ item }) => {
    const unreadCount = item.unreadCount[userId] || 0;
    const otherUser = item.participants.find(p => p._id !== userId);

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('Chat', { 
          conversationId: item._id,
          recipient: otherUser
        })}
      >
        <View style={styles.conversationItem}>
          <Avatar user={otherUser} />
          <View>
            <Text style={styles.name}>{otherUser.name}</Text>
            <Text style={styles.lastMessage}>
              {item.lastMessage?.content}
            </Text>
          </View>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text>{unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={conversations}
      renderItem={renderConversation}
      keyExtractor={item => item._id}
    />
  );
}
```

---

### 4. Receive Messages (Real-time)

#### Socket.IO Connection
```javascript
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

function useSocket() {
  const [socket, setSocket] = useState(null);
  const token = userToken; // Get from AsyncStorage

  useEffect(() => {
    const newSocket = io('https://your-api.com', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to chat');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from chat');
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [token]);

  return socket;
}

// In your chat screen
function ChatScreen({ route }) {
  const { recipientId } = route.params;
  const [messages, setMessages] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Receive new messages
    socket.on('message:new', (message) => {
      setMessages(prev => [...prev, message]);
      
      // Show notification if app is in background
      if (AppState.currentState !== 'active') {
        showNotification(message);
      }
    });

    // Message status updates
    socket.on('message:status', (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, status: data.status }
          : msg
      ));
    });

    // Typing indicators
    socket.on('typing:status', (data) => {
      if (data.userId === recipientId) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      socket.off('message:new');
      socket.off('message:status');
      socket.off('typing:status');
    };
  }, [socket, recipientId]);

  return (
    <View>
      <MessageList messages={messages} />
      {isTyping && <TypingIndicator />}
      <MessageInput socket={socket} recipientId={recipientId} />
    </View>
  );
}
```

---

### 5. Join Communities

#### Get User's Communities
```javascript
GET /chat/communities
Authorization: Bearer {user-token}

Response:
[
  {
    "_id": "comm1",
    "name": "Morning Warriors",
    "description": "6 AM workout group",
    "members": [...],
    "lastMessage": {...},
    "imageUrl": "https://..."
  }
]
```

#### Get Community Messages
```javascript
GET /chat/messages?communityId={communityId}&limit=50
Authorization: Bearer {user-token}

Response:
[
  {
    "_id": "msg1",
    "sender": { "name": "Coach John" },
    "content": "Great session today everyone!",
    "createdAt": "2026-01-13T...",
    "community": "comm1"
  }
]
```

#### Send Message to Community
```javascript
POST /chat/messages
Authorization: Bearer {user-token}

Body:
{
  "community": "communityId",
  "type": "text",
  "content": "Thanks coach! See you tomorrow 💪"
}
```

**React Native Component:**
```jsx
function CommunityChat({ communityId }) {
  const [messages, setMessages] = useState([]);
  const [community, setCommunity] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    // Load community details
    fetch(`https://api.com/chat/communities/${communityId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setCommunity);

    // Load messages
    fetch(`https://api.com/chat/messages?communityId=${communityId}&limit=50`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setMessages);

    // Listen for new messages
    socket?.on('message:new', (msg) => {
      if (msg.community === communityId) {
        setMessages(prev => [...prev, msg]);
      }
    });
  }, [communityId, socket]);

  const sendMessage = (text) => {
    socket.emit('send:message', {
      community: communityId,
      type: 'text',
      content: text
    });
  };

  return (
    <View>
      <CommunityHeader community={community} />
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} />
    </View>
  );
}
```

---

### 6. Receive Broadcast Messages

Broadcast messages from admin appear as regular messages in your inbox.

```javascript
// Automatically handled by Socket.IO
socket.on('message:new', (message) => {
  if (message.isBroadcast) {
    // Show as important/announcement message
    showBroadcastNotification(message);
  }
});
```

**React Native Component:**
```jsx
function BroadcastMessage({ message }) {
  return (
    <View style={styles.broadcastContainer}>
      <View style={styles.broadcastBadge}>
        <Text>📢 Announcement</Text>
      </View>
      <Text style={styles.broadcastContent}>
        {message.content}
      </Text>
      <Text style={styles.timestamp}>
        {formatTime(message.createdAt)}
      </Text>
    </View>
  );
}
```

---

### 7. Mark Messages as Read

#### Mark Message as Read
```javascript
POST /chat/messages/read
Authorization: Bearer {user-token}

Body:
{
  "messageId": "messageId"
}

// Or mark all in conversation
Body:
{
  "conversationId": "conversationId"
}
```

**Auto-mark as read when user opens chat:**
```jsx
function ChatScreen({ conversationId }) {
  useEffect(() => {
    // Mark all as read when user opens chat
    fetch('https://api.com/chat/messages/read', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversationId })
    });
  }, [conversationId]);

  return <ChatView />;
}
```

---

### 8. Delete Messages

#### Delete Own Message
```javascript
DELETE /chat/messages/{messageId}
Authorization: Bearer {user-token}

Response:
{
  "_id": "messageId",
  "isDeleted": true,
  "deletedAt": "2026-01-13T..."
}
```

**React Native Component:**
```jsx
function MessageBubble({ message, isOwnMessage }) {
  const [showOptions, setShowOptions] = useState(false);

  const deleteMessage = async () => {
    await fetch(`https://api.com/chat/messages/${message._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    socket.emit('message:delete', {
      messageId: message._id
    });
  };

  return (
    <TouchableOpacity
      onLongPress={() => isOwnMessage && setShowOptions(true)}
    >
      <View style={styles.messageBubble}>
        <Text>{message.content}</Text>
      </View>
      {showOptions && (
        <ActionSheet
          options={['Delete', 'Cancel']}
          onPress={deleteMessage}
        />
      )}
    </TouchableOpacity>
  );
}
```

---

### 9. Typing Indicators

#### Send Typing Status
```javascript
// Start typing
socket.emit('typing:start', {
  conversationId: 'conversationId'
});

// Stop typing (after 3 seconds of no input)
socket.emit('typing:stop', {
  conversationId: 'conversationId'
});
```

**React Native Component:**
```jsx
function MessageInput({ recipientId, socket }) {
  const [text, setText] = useState('');
  const typingTimeout = useRef(null);

  const handleTextChange = (value) => {
    setText(value);

    // Notify typing
    socket.emit('typing:start', {
      conversationId: getConversationId(recipientId)
    });

    // Clear previous timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Stop typing after 3 seconds
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing:stop', {
        conversationId: getConversationId(recipientId)
      });
    }, 3000);
  };

  return (
    <TextInput
      value={text}
      onChangeText={handleTextChange}
      placeholder="Type a message..."
    />
  );
}
```

---

### 10. Unread Count Badge

#### Get Total Unread Count
```javascript
GET /chat/unread-count
Authorization: Bearer {user-token}

Response:
{
  "unreadCount": 3
}
```

**React Native Component:**
```jsx
function TabNavigator() {
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket();

  useEffect(() => {
    // Fetch initial count
    fetch('https://api.com/chat/unread-count', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setUnreadCount(data.unreadCount));

    // Update on new messages
    socket?.on('message:new', () => {
      setUnreadCount(prev => prev + 1);
    });

    // Update on read messages
    socket?.on('message:status', (data) => {
      if (data.status === 'read') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    });
  }, [socket]);

  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : null
        }}
      />
    </Tab.Navigator>
  );
}
```

---

## 📱 User App Screen Structure

### Main Screens

1. **Messages Tab**
   - Conversation list
   - Unread badge
   - Search conversations
   - New message button

2. **Chat Screen**
   - Message history
   - Send text messages
   - Record voice notes
   - Typing indicator
   - Read receipts

3. **Communities Screen**
   - List of joined communities
   - Community chat
   - Member list

4. **Profile/Settings**
   - Notification settings
   - Chat preferences
   - Blocked users

---

## 🎨 User App UI Components

### 1. Message Bubble
```jsx
<MessageBubble
  message={message}
  isOwnMessage={message.sender._id === userId}
  showTimestamp={true}
  showReadStatus={true}
/>
```

### 2. Voice Note Player
```jsx
<VoiceNotePlayer
  audioUrl={message.mediaUrl}
  duration={message.mediaDuration}
  isPlaying={isPlaying}
  onPlay={handlePlay}
/>
```

### 3. Typing Indicator
```jsx
<TypingIndicator
  userName="Coach Mike"
  visible={isTyping}
/>
```

### 4. Conversation Item
```jsx
<ConversationItem
  user={otherUser}
  lastMessage={lastMessage}
  unreadCount={unreadCount}
  timestamp={lastMessageAt}
  onPress={() => openChat(conversationId)}
/>
```

---

## 📋 Complete User App Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/chat/messages` | POST | Send message |
| `/chat/messages` | GET | Get messages |
| `/chat/messages/:id` | DELETE | Delete message |
| `/chat/messages/read` | POST | Mark as read |
| `/chat/conversations` | GET | Get conversations |
| `/chat/unread-count` | GET | Get unread count |
| `/chat/communities` | GET | Get communities |
| `/chat/communities/:id` | GET | Get community details |
| `/chat/upload` | POST | Upload voice/media |

---

## 🔌 Socket.IO Events for Users

### Events to Emit (User → Server)
- `send:message` - Send message
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `message:read` - Mark message as read
- `message:delete` - Delete message

### Events to Listen (Server → User)
- `message:new` - Receive new message
- `message:status` - Message status update (delivered/read)
- `typing:status` - Typing indicator from other user
- `message:deleted` - Message was deleted

---

## 🚀 Implementation Checklist

### Phase 1 (MVP)
- [ ] Socket.IO connection
- [ ] Send/receive text messages
- [ ] Conversation list
- [ ] Chat screen with message history
- [ ] Unread count badge

### Phase 2 (Enhanced)
- [ ] Voice note recording
- [ ] Voice note playback
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Push notifications

### Phase 3 (Advanced)
- [ ] Communities
- [ ] Community chat
- [ ] Delete messages
- [ ] Message search
- [ ] Media sharing (images)

---

## 💡 User Experience Best Practices

### Notifications
- Show badge on Messages tab for unread count
- Push notification when new message arrives
- In-app notification sound for new messages
- Vibration on message received

### UI/UX Guidelines
- Messages from coach/admin have blue background
- User's own messages have gray background
- Broadcast messages have special icon (📢)
- Typing indicator shows "Coach is typing..."
- Voice notes show waveform animation
- Smooth scrolling to latest message
- Pull to refresh message history

### Performance
- Pagination for message history (load 50 at a time)
- Cache messages locally
- Optimize image/voice uploads
- Lazy load communities
- Background sync for offline messages

---

## 📱 Complete React Native Example

```jsx
// App.js - Main Chat Integration
import React, { createContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SocketContext = createContext();

function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const initSocket = async () => {
      const token = await AsyncStorage.getItem('authToken');
      
      const newSocket = io('https://your-api.com', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to chat');
      });

      setSocket(newSocket);
    };

    initSocket();

    return () => socket?.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SocketContext.Provider>
  );
}

export default App;
```

---

## 🎯 Summary for User App

**Key Features to Implement:**
1. ✅ Chat with coach/admin
2. ✅ Send voice notes
3. ✅ Join communities
4. ✅ Receive broadcasts
5. ✅ Real-time messaging
6. ✅ Read receipts
7. ✅ Typing indicators
8. ✅ Unread counts

**Priority Endpoints:**
- POST `/chat/messages` - Send messages
- GET `/chat/conversations` - Get chats
- GET `/chat/messages` - Get message history
- POST `/chat/upload` - Upload voice notes
- GET `/chat/unread-count` - Badge count

All features work seamlessly with Socket.IO for real-time updates! 🚀
