# Chat System - Community Management & Broadcasting Feature Documentation

## Overview

This document outlines the new features added to the chat system for community management and broadcasting capabilities. These features allow admins and coaches to manage communities and send broadcast messages to multiple users.

---

## Features

### 1. **Community Management** (Admin/Coach)

#### Capabilities:
- **Add Members**: Add new users to a community
- **Remove Members**: Remove members from a community  
- **Delete Community**: Delete an entire community (creator only)
- **View Members**: See all community members and their roles
- **Manage Admins**: Promote members to admin status (creator only)

#### Permissions:
- **Community Admin**: Can add/remove members, update community info
- **Community Creator**: Can delete community, promote admins
- **Regular Members**: Can only leave the community

---

### 2. **Broadcasting** (Admin/Coach)

#### Types of Broadcasts:

##### A. **Dashboard Broadcast**
Send messages to selected users across the system.

**Endpoint**: `POST /chat/dashboard/broadcast`

**Request Body**:
```json
{
  "content": "Your message here",
  "type": "announcement|alert|notification|text",
  "targetUserIds": ["userId1", "userId2", "userId3"],
  "mediaUrl": "optional-media-url",
  "mediaDuration": 0,
  "mediaSize": 0,
  "mimeType": "optional-mime-type"
}
```

**Response**:
```json
{
  "_id": "messageId",
  "sender": { /* sender details */ },
  "content": "Your message here",
  "type": "announcement",
  "isBroadcast": true,
  "broadcastRecipients": [/* list of recipients */],
  "createdAt": "2024-01-16T..."
}
```

##### B. **Community Broadcast**
Send announcement to all members of a specific community.

**Endpoint**: `POST /chat/communities/:communityId/broadcast`

**Permissions**: Community Admin only

**Request Body**:
```json
{
  "content": "Community announcement",
  "type": "announcement",
  "mediaUrl": "optional-media-url"
}
```

##### C. **Standard Broadcast**
Send to specific recipients using broadcast flag.

**Endpoint**: `POST /chat/broadcast`

**Request Body**:
```json
{
  "content": "Broadcast message",
  "type": "text",
  "broadcastRecipients": ["userId1", "userId2"],
  "isBroadcast": true
}
```

#### Broadcast Queries:

**Get Sent Broadcasts** (for dashboard):
```
GET /chat/broadcasts/sent?limit=50&skip=0
```

**Get Received Broadcasts**:
```
GET /chat/broadcasts/received?limit=50&skip=0
```

---

## Backend Implementation

### Updated User Roles (in `Server/src/user/user.types.ts`):
```typescript
export enum Role {
  Admin = 'admin',
  Coach = 'coach',  // NEW
  User = 'user'
}
```

### New Chat Service Methods:

#### Community Management:
- `addMembers()` - Add members to community
- `removeMember()` - Remove member from community
- `deleteCommunity()` - Soft delete community

#### Broadcasting:
- `sendBroadcast()` - Send to specific recipients
- `broadcastToCommunity()` - Send to all community members
- `sendDashboardBroadcast()` - Send to selected users
- `getUserBroadcasts()` - Get broadcasts sent by user
- `getUserBroadcastMessages()` - Get broadcasts received by user

### New Controller Endpoints:

```typescript
POST /chat/communities/:id/members          // Add members
DELETE /chat/communities/:id/members/:userId // Remove member
DELETE /chat/communities/:id                 // Delete community
POST /chat/communities/:id/broadcast         // Broadcast to community
POST /chat/dashboard/broadcast               // Dashboard broadcast
GET /chat/broadcasts/sent                    // Get sent broadcasts
GET /chat/broadcasts/received                // Get received broadcasts
```

---

## Frontend Implementation

### New Components:

#### 1. **CommunityManagement.jsx**
Located at: `Client/src/components/common/CommunityManagement.jsx`

**Props**:
- `communityId` (string): The community ID to manage

**Features**:
- Display community info
- List all members with roles
- Add new members (admin only)
- Remove members (admin only)
- Delete community (creator only)

**Usage**:
```jsx
import CommunityManagement from './CommunityManagement';

<CommunityManagement communityId={communityId} />
```

#### 2. **BroadcastingDashboard.jsx**
Located at: `Client/src/components/common/BroadcastingDashboard.jsx`

**Features**:
- Send broadcast messages to selected users
- View sent broadcasts (admin/coach only)
- View received broadcasts
- Different message types (text, announcement, alert, notification)
- User selection with search

**Usage**:
```jsx
import BroadcastingDashboard from './BroadcastingDashboard';

<BroadcastingDashboard />
```

### New Redux API Hooks (in `Client/src/redux/apis/chatApi.js`):

```javascript
// Community Management
useAddCommunityMembersMutation()
useRemoveCommunityMemberMutation()
useDeleteCommunityMutation()

// Broadcasting
useBroadcastToCommunitiyMutation()
useSendDashboardBroadcastMutation()
useGetUserBroadcastsSentQuery()
useGetUserBroadcastsReceivedQuery()
```

---

## Usage Examples

### Backend (NestJS)

#### Add Members to Community:
```typescript
await chatService.addMembers(userId, communityId, {
  userIds: ['user1Id', 'user2Id']
});
```

#### Send Dashboard Broadcast:
```typescript
await chatService.sendDashboardBroadcast(userId, {
  content: 'Important announcement',
  type: 'announcement',
  targetUserIds: ['user1Id', 'user2Id', 'user3Id']
});
```

#### Delete Community:
```typescript
await chatService.deleteCommunity(creatorId, communityId);
```

### Frontend (React)

#### Remove Member from Community:
```jsx
const [removeMember] = useRemoveCommunityMemberMutation();

const handleRemove = async (memberId) => {
  await removeMember({
    communityId: 'communityId123',
    userId: memberId
  }).unwrap();
};
```

#### Send Broadcast Message:
```jsx
const [sendBroadcast] = useSendDashboardBroadcastMutation();

const handleBroadcast = async () => {
  await sendBroadcast({
    content: 'Team meeting at 3 PM',
    type: 'announcement',
    targetUserIds: ['userId1', 'userId2', 'userId3']
  }).unwrap();
};
```

#### Get Received Broadcasts:
```jsx
const { data: broadcasts } = useGetUserBroadcastsReceivedQuery({
  limit: 50,
  skip: 0
});
```

---

## Security & Permissions

### Permission Matrix:

| Action | Creator | Admin | Coach | Member |
|--------|---------|-------|-------|--------|
| Create Community | ✓ | ✓ | ✓ | ✓ |
| Update Community | ✓ | ✓ | - | - |
| Delete Community | ✓ | - | - | - |
| Add Members | ✓ | ✓ | - | - |
| Remove Members | ✓ | ✓ | - | - |
| Send Broadcast | ✓ | ✓ | ✓ | - |
| View Broadcasts | ✓ | ✓ | ✓ | ✓ |
| Manage Admins | ✓ | - | - | - |

### Validation Rules:

1. **Community Management**:
   - Only community admins can add/remove members
   - Cannot remove community creator
   - Creator cannot leave community
   - Soft delete (isActive flag)

2. **Broadcasting**:
   - Only admin/coach can send broadcasts
   - At least one recipient required
   - Broadcast message stored with recipient list
   - Messages marked as broadcast in database

3. **Role-Based Access**:
   - Admin: Full system access
   - Coach: Can send broadcasts, manage coached communities
   - User: Can receive broadcasts, participate in communities

---

## Database Schema

### Updated Community Schema Fields:
```typescript
{
  _id: ObjectId,
  name: String,
  description: String,
  createdBy: ObjectId (User reference),
  admins: [ObjectId] (User references),
  members: [ObjectId] (User references),
  type: String (public|private|announcement),
  isActive: Boolean,
  bannedUsers: [ObjectId],
  settings: {
    allowMembersToPost: Boolean,
    allowMembersToAddOthers: Boolean,
    maxMembers: Number
  },
  lastMessage: ObjectId (Message reference),
  lastMessageAt: Date
}
```

### Message Broadcasting Fields:
```typescript
{
  _id: ObjectId,
  sender: ObjectId (User reference),
  content: String,
  isBroadcast: Boolean,
  broadcastRecipients: [ObjectId] (User references),
  type: String (text|announcement|alert|notification),
  createdAt: Date,
  isDeleted: Boolean
}
```

---

## Integration Guide

### Step 1: Import Components
```jsx
import CommunityManagement from '@/components/common/CommunityManagement';
import BroadcastingDashboard from '@/components/common/BroadcastingDashboard';
```

### Step 2: Add to Admin/Coach Dashboard
```jsx
// In admin/coach dashboard page
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <CommunityManagement communityId={selectedCommunityId} />
  <BroadcastingDashboard />
</div>
```

### Step 3: Add API Endpoints to Backend
- All endpoints already implemented in `chat.controller.ts`
- All service methods already implemented in `chat.service.ts`

### Step 4: Configure Permissions
- Update your authentication guard to check roles
- Ensure routes are protected with `@UseGuards(AuthGuard)`

---

## Error Handling

### Common Errors:

| Error | Cause | Solution |
|-------|-------|----------|
| 403 Forbidden | User not admin/coach | Check user role before action |
| 404 Not Found | Community/User doesn't exist | Verify IDs before request |
| 400 Bad Request | Missing required fields | Provide all required parameters |
| 401 Unauthorized | Not authenticated | Include valid auth token |

### Example Error Handling:
```jsx
try {
  await removeMember({ communityId, userId }).unwrap();
} catch (error) {
  if (error.status === 403) {
    toast.error('Only admins can remove members');
  } else if (error.status === 404) {
    toast.error('Member or community not found');
  } else {
    toast.error('An error occurred');
  }
}
```

---

## Testing Checklist

- [ ] Admin can add members to community
- [ ] Admin can remove members from community
- [ ] Creator can delete community
- [ ] Non-admin cannot perform admin actions
- [ ] Broadcast message received by all selected users
- [ ] Community broadcast reaches all members
- [ ] Broadcast history shows in dashboard
- [ ] Role-based access control working
- [ ] Socket events emit for real-time updates
- [ ] Unread counts update for broadcasts

---

## Future Enhancements

1. **Scheduled Broadcasts**: Send messages at specific times
2. **Broadcast Templates**: Pre-built message templates
3. **Broadcast Analytics**: View delivery and read stats
4. **Community Roles**: More granular role assignments
5. **Message Expiration**: Auto-delete broadcasts after time
6. **Media Broadcasting**: Support for image/video broadcasts
7. **Broadcast Groups**: Create groups for easier targeting
8. **Draft Broadcasts**: Save drafts before sending

---

## Support

For issues or questions:
1. Check error logs in browser console
2. Verify database permissions
3. Ensure all migrations have run
4. Check Socket.IO connection status
5. Review authentication token validity

---

**Last Updated**: January 16, 2026
**Version**: 1.0.0
