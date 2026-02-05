# Sequelize Models Documentation

## Overview
All 13 MVP Sequelize models have been created with proper TypeScript types, associations, and constraints following the MVP specification.

## Models Created

### 1. **User** (`src/db/models/User.ts`)
- **Primary Key**: UUID (auto-generated)
- **Attributes**: 
  - `fullName` (string, required)
  - `email` (string, unique, required)
  - `role` (enum: admin, moderator, employee)
  - `authProvider` (enum: local, google)
  - `passwordHash` (string, nullable) - for local auth
  - `googleId` (string, nullable, unique) - for Google auth
  - `profilePhotoUrl` (string, nullable)
  - `department` (string, nullable)
  - `isActive` (boolean, default: true)
  - `lastSeenAt` (date, nullable)
- **Timestamps**: `createdAt`, `updatedAt` (automatic)
- **Paranoid**: No (hard delete)

### 2. **Channel** (`src/db/models/Channel.ts`)
- **Primary Key**: UUID
- **Attributes**:
  - `name` (string, required)
  - `description` (text, nullable)
  - `type` (enum: public, private)
  - `createdBy` (FK to User)
- **Timestamps**: `createdAt`, `updatedAt`
- **Paranoid**: Yes (soft delete with `deletedAt`)

### 3. **ChannelMember** (`src/db/models/ChannelMember.ts`)
- **Primary Key**: Composite (channelId, userId)
- **Attributes**:
  - `joinedAt` (date, auto-set to NOW)
- **Timestamps**: No
- **Paranoid**: No
- **Purpose**: Many-to-many mapping of Users to Channels

### 4. **ChannelInvite** (`src/db/models/ChannelInvite.ts`)
- **Primary Key**: UUID
- **Attributes**:
  - `channelId` (FK to Channel)
  - `invitedUserId` (FK to User - recipient)
  - `invitedBy` (FK to User - sender)
  - `status` (enum: pending, accepted, rejected)
- **Timestamps**: `createdAt` only (no updatedAt)
- **Paranoid**: No

### 5. **Group** (`src/db/models/Group.ts`)
- **Primary Key**: UUID
- **Attributes**:
  - `name` (string, required)
  - `description` (text, nullable)
  - `createdBy` (FK to User)
- **Timestamps**: `createdAt` only
- **Paranoid**: Yes (soft delete with `deletedAt`)

### 6. **GroupMember** (`src/db/models/GroupMember.ts`)
- **Primary Key**: Composite (groupId, userId)
- **Attributes**:
  - `joinedAt` (date, auto-set to NOW)
- **Timestamps**: No
- **Paranoid**: No
- **Purpose**: Many-to-many mapping of Users to Groups

### 7. **Post** (`src/db/models/Post.ts`)
- **Primary Key**: UUID
- **Attributes**:
  - `authorId` (FK to User)
  - `channelId` (FK to Channel, nullable)
  - `groupId` (FK to Group, nullable)
  - `content` (text, required)
  - `isPinned` (boolean, default: false)
  - `isDeleted` (boolean, default: false)
- **Timestamps**: `createdAt`, `updatedAt`
- **Paranoid**: No
- **Constraint**: **EXACTLY ONE** of `channelId` or `groupId` must be set (enforced via model validation)

### 8. **Comment** (`src/db/models/Comment.ts`)
- **Primary Key**: UUID
- **Attributes**:
  - `postId` (FK to Post)
  - `authorId` (FK to User)
  - `content` (text, required)
  - `isDeleted` (boolean, default: false)
- **Timestamps**: `createdAt` only
- **Paranoid**: No

### 9. **PostReaction** (`src/db/models/PostReaction.ts`)
- **Primary Key**: Composite (postId, userId)
- **Attributes**:
  - `emoji` (string, required)
- **Timestamps**: `createdAt` only
- **Paranoid**: No
- **Purpose**: User emoji reactions to posts

### 10. **DMConversation** (`src/db/models/DMConversation.ts`)
- **Primary Key**: UUID
- **Attributes**:
  - `isGroup` (boolean, default: false)
- **Timestamps**: `createdAt` only
- **Paranoid**: No

### 11. **DMParticipant** (`src/db/models/DMParticipant.ts`)
- **Primary Key**: Composite (conversationId, userId)
- **Attributes**:
  - `joinedAt` (date, auto-set to NOW)
- **Timestamps**: No
- **Paranoid**: No
- **Purpose**: Many-to-many mapping of Users to DM Conversations

### 12. **DMMessage** (`src/db/models/DMMessage.ts`)
- **Primary Key**: UUID
- **Attributes**:
  - `conversationId` (FK to DMConversation)
  - `senderId` (FK to User)
  - `content` (text, required)
  - `imageUrl` (string, nullable)
  - `isDeleted` (boolean, default: false)
- **Timestamps**: `createdAt` only
- **Paranoid**: No

### 13. **Notification** (`src/db/models/Notification.ts`)
- **Primary Key**: UUID
- **Attributes**:
  - `userId` (FK to User)
  - `type` (string, required)
  - `referenceId` (UUID, nullable - polymorphic reference)
  - `isRead` (boolean, default: false)
- **Timestamps**: `createdAt` only
- **Paranoid**: No

## Associations

### User Associations
- `hasMany` Channel (via `createdBy`)
- `hasMany` Group (via `createdBy`)
- `hasMany` Post (via `authorId`)
- `hasMany` Comment (via `authorId`)
- `hasMany` DMMessage (via `senderId`)
- `hasMany` ChannelInvite (via `invitedBy` and `invitedUserId`)
- `hasMany` Notification (via `userId`)
- `belongsToMany` Channel (through ChannelMember)
- `belongsToMany` Group (through GroupMember)
- `belongsToMany` Post (through PostReaction - reactive posts)
- `belongsToMany` DMConversation (through DMParticipant)

### Channel Associations
- `belongsTo` User (creator)
- `hasMany` ChannelMember
- `hasMany` ChannelInvite
- `hasMany` Post
- `belongsToMany` User (through ChannelMember)

### Group Associations
- `belongsTo` User (creator)
- `hasMany` GroupMember
- `hasMany` Post
- `belongsToMany` User (through GroupMember)

### Post Associations
- `belongsTo` User (author)
- `belongsTo` Channel (nullable)
- `belongsTo` Group (nullable)
- `hasMany` Comment
- `hasMany` PostReaction
- `belongsToMany` User (through PostReaction)

### Other Associations
- `Comment.belongsTo` Post, User
- `PostReaction.belongsTo` Post, User
- `DMConversation.hasMany` DMParticipant, DMMessage
- `DMConversation.belongsToMany` User (through DMParticipant)
- `DMMessage.belongsTo` DMConversation, User
- `Notification.belongsTo` User
- `ChannelInvite.belongsTo` Channel, User (inviter/invitee)
- `ChannelMember.belongsTo` Channel, User
- `GroupMember.belongsTo` Group, User
- `DMParticipant.belongsTo` DMConversation, User

## Key Features

### 1. TypeScript Support
- All models have proper TypeScript interfaces for attributes
- Full type safety for model instances and operations
- Exported type definitions for use in services and controllers

### 2. UUID Primary Keys
- All models use UUID (v4) as primary key
- Auto-generated on creation using `uuidv4()`
- Enables better distributed system support

### 3. Soft Deletes (Paranoid)
- Channel: Yes
- Group: Yes
- All others: No
- Models with `paranoid: true` automatically add `deletedAt` timestamp
- Soft-deleted records are excluded from queries by default

### 4. Constraints
- **Post Model**: Custom validation ensures exactly ONE of `channelId` or `groupId` is set
- **Email**: Unique constraint on User.email
- **GoogleId**: Unique constraint on User.googleId for Google auth
- **Foreign Keys**: All FKs configured with CASCADE delete where appropriate

### 5. Model Initialization
- All models initialized in `src/db/models/index.ts`
- `initializeModels(sequelize)` function handles:
  - Individual model initialization
  - Association definitions
  - Validation rules

### 6. Database Integration
- Models automatically initialized when Sequelize connects
- Can be accessed via `sequelize.models` for dynamic queries
- Full support for Sequelize query methods (findAll, create, update, destroy, etc.)

## Usage Example

```typescript
import { User, Channel, Post } from 'src/db/models';

// Create a user
const user = await User.create({
  fullName: 'John Doe',
  email: 'john@example.com',
  role: 'employee',
  authProvider: 'local',
  passwordHash: hashedPassword
});

// Create a channel
const channel = await Channel.create({
  name: 'General',
  type: 'public',
  createdBy: user.id
});

// Create a post
const post = await Post.create({
  authorId: user.id,
  channelId: channel.id,
  content: 'Hello everyone!'
});

// Query with associations
const postWithDetails = await Post.findByPk(post.id, {
  include: ['author', 'channel', 'comments', 'reactions']
});

// Add member to channel
await channel.addUser(user);
```

## Testing

Run the test models script to verify all models are properly initialized:

```bash
npx tsx src/test-models.ts
```

Expected output shows:
- ✓ Database connection established
- ✓ All models initialized
- ✓ Model associations configured
- List of all 13 registered models

## Next Steps

1. **Create Database Migrations** - Use Sequelize migrations to sync schema with database
2. **Implement Services** - Add business logic in `src/services/`
3. **Implement Controllers** - Add API handlers in `src/controllers/`
4. **Add Input Validation** - Create validation middleware using Joi or Zod
5. **Add Error Handling** - Implement proper error responses for model operations

