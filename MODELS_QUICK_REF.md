# Sequelize Models Quick Reference

## File Structure
```
src/db/models/
├── index.ts              # Model initialization and associations
├── User.ts              # User model (auth + profile)
├── Channel.ts           # Channel model (discussions)
├── ChannelMember.ts     # Channel membership (join table)
├── ChannelInvite.ts     # Channel invitations
├── Group.ts             # Group model (team/project)
├── GroupMember.ts       # Group membership (join table)
├── Post.ts              # Post/thread model (channel or group)
├── Comment.ts           # Comment on posts
├── PostReaction.ts      # Emoji reactions (join table)
├── DMConversation.ts    # Direct message conversation
├── DMParticipant.ts     # DM conversation participants (join table)
├── DMMessage.ts         # Direct messages
└── Notification.ts      # User notifications
```

## Data Model Summary

### Identity
- **User**: Supports local (password) and Google OAuth authentication
  - Email uniqueness constraint
  - GoogleId uniqueness constraint
  - Can be admin, moderator, or employee

### Communication Channels
- **Channel** (soft-delete): Public or private discussion spaces
  - Created by a user
  - Multiple members via ChannelMember
  - Invitable via ChannelInvite

- **Group** (soft-delete): Team/project groupings
  - Created by a user
  - Multiple members via GroupMember
  - No direct invitation system (TBD in Phase 2)

### Content
- **Post**: Created in either Channel OR Group (never both)
  - Can be pinned
  - Has comment thread
  - Users can react with emoji

- **Comment**: Reply to a post
  - Can be marked as deleted
  - Single level (no nested comments)

- **PostReaction**: Emoji reaction to post
  - Composite key: (postId, userId)

### Direct Messaging
- **DMConversation**: 1:1 or group DM space
  - `isGroup` flag for multi-user conversations
  - Has multiple participants
  - Contains messages

- **DMParticipant**: DM conversation membership
- **DMMessage**: Individual DM messages

### Notifications
- **Notification**: User notifications
  - Generic `type` field (e.g., "post_comment", "channel_invite")
  - `referenceId` for polymorphic references
  - `isRead` flag for status

## Key Constraints

### Post Model Constraint
```sql
-- Post must have EITHER channelId OR groupId, never both
CHECK (
  (channel_id IS NOT NULL AND group_id IS NULL) OR
  (channel_id IS NULL AND group_id IS NOT NULL)
)
```
Implemented via Sequelize model validation.

### Unique Constraints
- User.email
- User.googleId

### Foreign Key Relationships
- All models with foreign keys have CASCADE delete
- Soft-deleted channels/groups don't cascade automatically (paranoid safe delete)

## Association Patterns

### One-to-Many
- User → Channel (createdBy)
- User → Post (authorId)
- User → Comment (authorId)
- Channel → ChannelMember
- Channel → ChannelInvite
- Channel → Post
- Group → GroupMember
- Group → Post
- Post → Comment
- Post → PostReaction
- DMConversation → DMMessage
- User → Notification

### Many-to-Many
- User ↔ Channel (through ChannelMember)
- User ↔ Group (through GroupMember)
- User ↔ Post reactions (through PostReaction)
- User ↔ DMConversation (through DMParticipant)

### Polymorphic
- ChannelInvite: Dual FK to User (inviter + invitee)
- Notification: `referenceId` references various entity IDs

## Timestamp Behavior

| Model | createdAt | updatedAt | deletedAt | paranoid |
|-------|-----------|-----------|-----------|----------|
| User | ✓ | ✓ | - | No |
| Channel | ✓ | ✓ | ✓ | Yes |
| ChannelMember | - | - | - | No |
| ChannelInvite | ✓ | - | - | No |
| Group | ✓ | - | ✓ | Yes |
| GroupMember | - | - | - | No |
| Post | ✓ | ✓ | - | No |
| Comment | ✓ | - | - | No |
| PostReaction | ✓ | - | - | No |
| DMConversation | ✓ | - | - | No |
| DMParticipant | - | - | - | No |
| DMMessage | ✓ | - | - | No |
| Notification | ✓ | - | - | No |

## Getting Started

### Initialize Models
```typescript
import { initializeModels } from 'src/db/models';
import sequelize from 'src/db';

// Models are auto-initialized when sequelize connects
// Access them via:
import { User, Channel, Post, ... } from 'src/db/models';
```

### Create Records
```typescript
const user = await User.create({
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  role: 'employee',
  authProvider: 'local',
  passwordHash: 'hashed_password'
});

const channel = await Channel.create({
  name: 'announcements',
  type: 'public',
  createdBy: user.id
});
```

### Query with Associations
```typescript
// Include related data
const post = await Post.findByPk(postId, {
  include: [
    { association: 'author', model: User },
    { association: 'channel', model: Channel },
    { association: 'comments', model: Comment }
  ]
});

// Query through many-to-many
const userChannels = await user.getChannels();
const channelMembers = await channel.getUsers();
```

### Soft Deletes (Paranoid Models)
```typescript
// Soft delete
await channel.destroy(); // Sets deletedAt timestamp

// Force hard delete
await channel.destroy({ force: true });

// Include soft-deleted records
await Channel.findAll({ paranoid: false });
```

## Next Implementation Steps

1. **Migrations**: Create Sequelize migrations for database schema
2. **Services**: Implement business logic layer
3. **Controllers**: Implement API endpoints
4. **Validation**: Add input validation middleware
5. **Error Handling**: Implement custom error responses
6. **Testing**: Write unit and integration tests

