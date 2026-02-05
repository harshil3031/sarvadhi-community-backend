# Seeder Reference - Deterministic IDs

Quick reference for all deterministic IDs used in seeders.

## Users

| Role | Name | Email | ID |
|------|------|-------|-----|
| Admin | Admin User | admin@sarvadhi.com | `11111111-1111-1111-1111-111111111111` |
| Moderator | Sarah Johnson | sarah.johnson@sarvadhi.com | `22222222-2222-2222-2222-222222222222` |
| Moderator | Michael Chen | michael.chen@sarvadhi.com | `22222222-2222-2222-2222-222222222223` |
| Employee | Emily Rodriguez | emily.rodriguez@sarvadhi.com | `33333333-3333-3333-3333-333333333331` |
| Employee | David Kim | david.kim@sarvadhi.com | `33333333-3333-3333-3333-333333333332` |
| Employee | Jessica Williams | jessica.williams@sarvadhi.com | `33333333-3333-3333-3333-333333333333` |
| Employee | James Brown | james.brown@sarvadhi.com | `33333333-3333-3333-3333-333333333334` |
| Employee | Olivia Martinez | olivia.martinez@sarvadhi.com | `33333333-3333-3333-3333-333333333335` |

**Password for all users:** `password123`

## Channels

| Name | Type | ID |
|------|------|-----|
| General | Public | `44444444-4444-4444-4444-444444444441` |
| Engineering | Public | `44444444-4444-4444-4444-444444444442` |
| Leadership | Private | `44444444-4444-4444-4444-444444444443` |

## Groups

| Name | Creator | ID |
|------|---------|-----|
| Design Team | David Kim (employee2) | `55555555-5555-5555-5555-555555555551` |
| Book Club | Jessica Williams (employee3) | `55555555-5555-5555-5555-555555555552` |

## Posts

### Channel Posts

| Title/Context | Channel | ID |
|---------------|---------|-----|
| Welcome to Sarvadhi (pinned) | General | `66666666-6666-6666-6666-666666666661` |
| New features announcement | General | `66666666-6666-6666-6666-666666666662` |
| Code review request | Engineering | `66666666-6666-6666-6666-666666666663` |
| Architecture discussion (pinned) | Engineering | `66666666-6666-6666-6666-666666666664` |
| Q1 Strategic goals (pinned) | Leadership | `66666666-6666-6666-6666-666666666665` |

### Group Posts

| Title/Context | Group | ID |
|---------------|-------|-----|
| Figma component library | Design Team | `66666666-6666-6666-6666-666666666671` |
| Color palette accessibility | Design Team | `66666666-6666-6666-6666-666666666672` |
| This month's book (pinned) | Book Club | `66666666-6666-6666-6666-666666666673` |
| Atomic Habits recommendation | Book Club | `66666666-6666-6666-6666-666666666674` |

## DM Conversations

| Participants | ID |
|--------------|-----|
| Admin ↔ Sarah Johnson (moderator1) | `88888888-8888-8888-8888-888888888881` |
| Emily Rodriguez ↔ David Kim | `88888888-8888-8888-8888-888888888882` |
| Jessica Williams ↔ James Brown | `88888888-8888-8888-8888-888888888883` |

## Comments

Comments have IDs in the range: `77777777-7777-7777-7777-7777777777XX`
- Total: 14 comments across posts

## DM Messages

Messages have IDs in the range: `99999999-9999-9999-9999-9999999999XX`
- Total: 9 messages across 3 conversations

## Import Constants in Code

```typescript
// Import user IDs
import { USER_IDS } from './01-users.seeder.js';

// Import channel IDs
import { CHANNEL_IDS } from './02-channels.seeder.js';

// Import group IDs
import { GROUP_IDS } from './03-groups.seeder.js';

// Import post IDs
import { POST_IDS } from './04-posts.seeder.js';

// Import conversation IDs
import { CONVERSATION_IDS } from './07-dm-conversations.seeder.js';
```

## Usage Examples

### Test Authentication
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sarvadhi.com",
    "password": "password123"
  }'
```

### Get Channel Posts
```bash
# General channel posts
curl "http://localhost:5000/api/posts?channelId=44444444-4444-4444-4444-444444444441" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Specific Post
```bash
# Get welcome post
curl "http://localhost:5000/api/posts/66666666-6666-6666-6666-666666666661" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Comments
```bash
# Get comments on welcome post
curl "http://localhost:5000/api/comments?postId=66666666-6666-6666-6666-666666666661" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
