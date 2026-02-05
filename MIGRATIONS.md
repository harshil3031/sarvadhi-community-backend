# Database Migrations Guide

## Overview
All 13 MVP tables have Sequelize migrations generated. Migrations are version-controlled and must be run to create the database schema.

## Migration Files

```
src/db/migrations/
├── 20260204000001-create-users.cjs
├── 20260204000002-create-channels.cjs
├── 20260204000003-create-channel-members.cjs
├── 20260204000004-create-channel-invites.cjs
├── 20260204000005-create-groups.cjs
├── 20260204000006-create-group-members.cjs
├── 20260204000007-create-posts.cjs
├── 20260204000008-create-comments.cjs
├── 20260204000009-create-post-reactions.cjs
├── 20260204000010-create-dm-conversations.cjs
├── 20260204000011-create-dm-participants.cjs
├── 20260204000012-create-dm-messages.cjs
└── 20260204000013-create-notifications.cjs
```

**Note**: Files use `.cjs` extension for CommonJS compatibility with ES modules project.

## Setup Instructions

### 1. Ensure Database Exists
```bash
createdb sarvadhi_community
```

### 2. Run Migrations
```bash
npm run db:migrate
```

This creates all tables with:
- UUID primary keys (UUIDV4)
- Proper foreign key constraints with CASCADE delete
- Indexes on foreign keys and frequently queried columns
- Correct data types and constraints per spec
- Timestamps (createdAt, updatedAt, deletedAt)

### 3. Verify Migration Status
```bash
npx sequelize-cli db:migrate:status
```

Expected output:
```
Executed migration: 20260204000001-create-users.js
Executed migration: 20260204000002-create-channels.js
Executed migration: 20260204000003-create-channel-members.js
... (all 13 migrations)
```

## Common Commands

### Run Migrations
```bash
npm run db:migrate
```

### Undo Last Migration
```bash
npm run db:migrate:undo
```

### Undo All Migrations
```bash
npm run db:migrate:undo:all
```

### Check Migration Status
```bash
npx sequelize-cli db:migrate:status
```

## Migration Details

### User Table (20260204000001-create-users.js)
- UUID primary key
- Unique email constraint
- Unique googleId constraint (nullable)
- ENUM for role (admin, moderator, employee)
- ENUM for authProvider (local, google)
- Indexes: email, googleId

### Channel Table (20260204000002-create-channels.js)
- UUID primary key
- FK to users (createdBy) with CASCADE delete
- ENUM type (public, private)
- Paranoid (includes deletedAt)
- Indexes: created_by, deleted_at

### ChannelMember Table (20260204000003-create-channel-members.js)
- Composite primary key: (channel_id, user_id)
- FKs with CASCADE delete
- Indexes: channel_id, user_id

### ChannelInvite Table (20260204000004-create-channel-invites.js)
- UUID primary key
- FK to channels (CASCADE delete)
- FK to users (invited_user_id, CASCADE delete)
- FK to users (invited_by, CASCADE delete)
- ENUM status (pending, accepted, rejected)
- Indexes: channel_id, invited_user_id, invited_by, status

### Group Table (20260204000005-create-groups.js)
- UUID primary key
- FK to users (createdBy) with CASCADE delete
- Paranoid (includes deletedAt)
- Indexes: created_by, deleted_at

### GroupMember Table (20260204000006-create-group-members.js)
- Composite primary key: (group_id, user_id)
- FKs with CASCADE delete
- Indexes: group_id, user_id

### Post Table (20260204000007-create-posts.js)
- UUID primary key
- FK to users (authorId) with CASCADE delete
- FK to channels (nullable, CASCADE delete)
- FK to groups (nullable, CASCADE delete)
- Boolean flags: isPinned, isDeleted
- Indexes: author_id, channel_id, group_id, is_deleted

### Comment Table (20260204000008-create-comments.js)
- UUID primary key
- FK to posts (CASCADE delete)
- FK to users (authorId, CASCADE delete)
- Boolean isDeleted flag
- Indexes: post_id, author_id, is_deleted

### PostReaction Table (20260204000009-create-post-reactions.js)
- Composite primary key: (post_id, user_id)
- FKs with CASCADE delete
- String emoji field
- Indexes: post_id, user_id

### DMConversation Table (20260204000010-create-dm-conversations.js)
- UUID primary key
- Boolean isGroup flag
- Indexes: is_group

### DMParticipant Table (20260204000011-create-dm-participants.js)
- Composite primary key: (conversation_id, user_id)
- FKs with CASCADE delete
- Indexes: conversation_id, user_id

### DMMessage Table (20260204000012-create-dm-messages.js)
- UUID primary key
- FK to dm_conversations (CASCADE delete)
- FK to users (senderId, CASCADE delete)
- Nullable imageUrl
- Boolean isDeleted flag
- Indexes: conversation_id, sender_id, is_deleted

### Notification Table (20260204000013-create-notifications.js)
- UUID primary key
- FK to users (CASCADE delete)
- String type field
- Nullable referenceId (polymorphic)
- Boolean isRead flag
- Indexes: user_id, is_read, type

## Migration Strategy

### Development
1. Run all migrations: `npm run db:migrate`
2. Make model changes
3. Create new migration if needed
4. Test with `npm run dev`

### Production Deployment
1. Run migrations on staging first
2. Verify data integrity
3. Run migrations on production: `npm run db:migrate`
4. Monitor for any errors
5. Keep rollback plan: `npm run db:migrate:undo`

## Naming Conventions

### Database Column Names
- Snake_case: `created_by`, `user_id`, `channel_id`
- Sequelize handles camelCase to snake_case conversion automatically

### Foreign Keys
- Explicit `field: 'snake_case'` in migrations
- Explicit `foreignKey: 'camelCase'` in models

### Indexes
- Added for all foreign keys
- Added for frequently queried columns (deleted, status, is_read)

## Constraints

### Referential Integrity
- All foreign keys enforce `onDelete: 'CASCADE'`
- Deleting a user cascades to all their posts, comments, etc.
- Deleting a channel cascades to posts, members, invites

### Unique Constraints
- User.email (UNIQUE)
- User.googleId (UNIQUE)

### Check Constraints
- Post: EITHER channel_id OR group_id (enforced via model validation, not DB constraint)

## No Auto-Sync
❌ **Sequelize.sync() is NOT used**
✅ **All schema changes use migrations**

Benefits:
- Version control
- Rollback capability
- Production-safe
- Clear audit trail
- Team collaboration

## Rollback Procedures

### Rollback Last Migration
```bash
npm run db:migrate:undo
```

### Rollback Specific Migration
```bash
npx sequelize-cli db:migrate:undo --name=20260204000007-create-posts.js
```

### Rollback All (Caution!)
```bash
npm run db:migrate:undo:all
```
Only use in development!

## SequelizeConfig

Configuration file: `src/db/config.json`

- **development**: Uses DATABASE_URL, logging enabled
- **staging**: Uses DATABASE_URL with SSL
- **production**: Uses DATABASE_URL with SSL

Environment selection: `NODE_ENV` variable

## Troubleshooting

### Migration Already Applied
```
SequelizeBaseError: constraint "fk_..." does not exist
```
Solution: Sequelize tracks migrations in `sequelizemeta` table. Check status and ensure migrations are in correct order.

### Invalid UUID Format
```
error: invalid input syntax for type uuid
```
Solution: Ensure UUIDs are generated with `Sequelize.UUIDV4` in migrations.

### Foreign Key Constraint Fails
```
QuerySequenceError: insert or update on table "posts" violates
```
Solution: Ensure referenced records exist and foreign key types match.

### Need to Create New Migration
```bash
npx sequelize-cli migration:generate --name=add-field-to-users
```
Then edit the generated file in `src/db/migrations/`

