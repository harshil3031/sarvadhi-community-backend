# Database Seeders

Comprehensive seeders for MVP testing with realistic data.

## Seeded Data

### Users (8 total)
- **1 Admin**: admin@sarvadhi.com
- **2 Moderators**: sarah.johnson@sarvadhi.com, michael.chen@sarvadhi.com
- **5 Employees**: emily.rodriguez@sarvadhi.com, david.kim@sarvadhi.com, jessica.williams@sarvadhi.com, james.brown@sarvadhi.com, olivia.martinez@sarvadhi.com

All passwords: `password123`

### Channels (3 total)
1. **General** (Public) - All users are members
2. **Engineering** (Public) - Moderators and some employees
3. **Leadership** (Private) - Admin and moderators only

### Groups (2 total)
1. **Design Team** - Led by David Kim (employee2)
2. **Book Club** - Led by Jessica Williams (employee3)

### Content
- **9 Posts** (5 in channels, 4 in groups)
- **14 Comments** on various posts
- **31 Reactions** (emojis) on posts
- **3 DM Conversations** with 9 messages total

## Usage

### Run All Seeders

```bash
npm run seed
```

This will:
1. Build TypeScript files
2. Clean existing data
3. Seed all tables in order
4. Display summary

### Manual Execution

```bash
# Build first
npm run build

# Run seeder
node dist/seeders/runSeeder.js
```

## Seeder Files

Seeders execute in this order:

1. `01-users.seeder.ts` - Create users with roles
2. `02-channels.seeder.ts` - Create channels and memberships
3. `03-groups.seeder.ts` - Create groups and memberships
4. `04-posts.seeder.ts` - Create posts in channels/groups
5. `05-comments.seeder.ts` - Create comments on posts
6. `06-reactions.seeder.ts` - Create emoji reactions
7. `07-dm-conversations.seeder.ts` - Create DM conversations and messages

## Deterministic IDs

All entities use deterministic UUIDs for easy reference:

```typescript
// Users
USER_IDS.admin = '11111111-1111-1111-1111-111111111111'
USER_IDS.moderator1 = '22222222-2222-2222-2222-222222222222'
USER_IDS.employee1 = '33333333-3333-3333-3333-333333333331'

// Channels
CHANNEL_IDS.general = '44444444-4444-4444-4444-444444444441'
CHANNEL_IDS.engineering = '44444444-4444-4444-4444-444444444442'

// Groups
GROUP_IDS.designTeam = '55555555-5555-5555-5555-555555555551'
GROUP_IDS.bookClub = '55555555-5555-5555-5555-555555555552'

// Posts
POST_IDS.generalWelcome = '66666666-6666-6666-6666-666666666661'
// ... and more
```

## Testing Scenarios

The seed data enables testing:

### Authentication
- Login with different roles
- Test role-based permissions

### Channels
- Public channel access (General, Engineering)
- Private channel restrictions (Leadership)
- Channel membership management

### Groups
- Creator-only permissions (update/delete/invite)
- Group membership

### Posts & Interactions
- Create posts in channels/groups
- Comment on existing posts
- React to posts
- Pin/unpin posts (moderator only)

### Direct Messages
- Existing conversations to test retrieval
- Send messages in conversations
- Real-time WebSocket events

### Notifications
- Backend creates notifications when:
  - Comments are added
  - Posts are reacted to
  - Users are invited to channels/groups
  - DM messages are received

## Example API Tests

```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sarvadhi.com","password":"password123"}'

# Get General channel posts
curl http://localhost:5000/api/posts?channelId=44444444-4444-4444-4444-444444444441 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get DM conversations
curl http://localhost:5000/api/dm/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Reset Database

To reset and re-seed:

```bash
# Undo all migrations
npm run db:migrate:undo:all

# Run migrations again
npm run db:migrate

# Seed data
npm run seed
```

## Notes

- All timestamps are set relative to runtime for realistic data
- Profile pictures use pravatar.cc for placeholder images
- Content is realistic and diverse for comprehensive testing
- Foreign key relationships are properly maintained
- Soft deletes (paranoid) are respected where applicable
