# Sarvadhi Community – API & Database Specification (MVP)

> **Purpose**: This document is a single source of truth for VS Code Copilot / AI tools.
> It defines **what APIs exist** and **what database schema supports them**.
> Scope is **MVP only** – scalable by extension, not rewrite.

---

## 1. High-Level Architecture

- Client: React Native (Expo)
- Backend: Node.js (Express)
- Database: PostgreSQL
- Real-time: WebSocket (for Direct Messages only)

Rules:
- Frontend NEVER enforces permissions
- Backend ALWAYS enforces permissions
- Database stores facts only (no business logic)

---

## 2. Authentication APIs

### POST /auth/register
Create user with email + password

Request:
```json
{
  "fullName": "Alice Johnson",
  "email": "alice@sarvadhi.com",
  "password": "StrongPassword123"
}
```

---

### POST /auth/login
Login using email + password

---

### POST /auth/google
Login / signup using Google OAuth

Request:
```json
{
  "idToken": "google_id_token"
}
```

Response (same for all login methods):
```json
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "fullName": "Alice Johnson",
    "role": "employee"
  }
}
```

---

### GET /auth/me
Returns current logged-in user

---

## 3. User APIs

- GET /users/me
- PUT /users/me
- GET /users/:id
- GET /users/search?q=alice

---

## 4. Channel APIs (Moderator/Admin)

- POST /channels
- GET /channels/public
- GET /channels/:id
- PUT /channels/:id
- DELETE /channels/:id

Membership:
- POST /channels/:id/join
- POST /channels/:id/leave
- POST /channels/:id/request (private)
- POST /channels/:id/approve
- POST /channels/:id/invite

---

## 5. Group APIs (Employee)

- POST /groups
- GET /groups/my
- GET /groups/:id
- PUT /groups/:id (creator only)
- DELETE /groups/:id

Membership:
- POST /groups/:id/invite
- POST /groups/:id/leave
- POST /groups/:id/remove-user

---

## 6. Post APIs (Channels + Groups)

- POST /posts
- GET /posts?channelId=UUID
- GET /posts?groupId=UUID
- PUT /posts/:id
- DELETE /posts/:id
- POST /posts/:id/pin
- POST /posts/:id/unpin

Create Post Request:
```json
{
  "content": "Hello team",
  "channelId": "uuid"
}
```

Rules:
- Either channelId OR groupId is required
- Never both

---

## 7. Comment APIs

- POST /posts/:id/comments
- GET /posts/:id/comments
- DELETE /comments/:id

---

## 8. Reaction APIs (Posts only – MVP)

- POST /posts/:id/reactions
- DELETE /posts/:id/reactions

```json
{
  "emoji": "👍"
}
```

---

## 9. Direct Message APIs

### REST
- GET /dms/conversations
- GET /dms/:conversationId/messages

### WebSocket Events

- send_message
- receive_message
- typing
- stop_typing

send_message payload:
```json
{
  "conversationId": "uuid",
  "text": "Hello"
}
```

---

## 10. Notification APIs

- GET /notifications
- POST /notifications/:id/read
- POST /notifications/read-all

---

## 11. Database Schema (MVP)

### users
Stores identity & auth

Columns:
- id (uuid, pk)
- full_name
- email (unique)
- role (admin/moderator/employee)
- auth_provider (local/google)
- password_hash (nullable)
- google_id (nullable)
- profile_photo_url
- department
- is_active
- last_seen_at
- created_at
- updated_at

---

### channels
Official communication spaces

- id
- name
- description
- type (public/private)
- created_by (user_id)
- created_at
- updated_at
- deleted_at

---

### channel_members
Many-to-many mapping

- channel_id
- user_id
- joined_at

Primary Key: (channel_id, user_id)

---

### channel_invites
Private channel flow

- id
- channel_id
- invited_user_id
- invited_by
- status (pending/accepted/rejected)
- created_at

---

### groups
Employee-created groups

- id
- name
- description
- created_by
- created_at
- deleted_at

---

### group_members

- group_id
- user_id
- joined_at

Primary Key: (group_id, user_id)

---

### posts
Feed-style content

- id
- author_id
- channel_id (nullable)
- group_id (nullable)
- content
- is_pinned
- is_deleted
- created_at
- updated_at

Constraint:
- Exactly one of channel_id or group_id must exist

---

### comments
Flat comments (MVP)

- id
- post_id
- author_id
- content
- is_deleted
- created_at

---

### post_reactions

- post_id
- user_id
- emoji
- created_at

Primary Key: (post_id, user_id)

---

### dm_conversations

- id
- is_group
- created_at

---

### dm_participants

- conversation_id
- user_id
- joined_at

Primary Key: (conversation_id, user_id)

---

### dm_messages

- id
- conversation_id
- sender_id
- content
- image_url
- is_deleted
- created_at

---

### notifications

- id
- user_id
- type
- reference_id
- is_read
- created_at

---

## 12. Tables Added Later (Not MVP)

- post_media
- comment_reactions
- mentions
- bookmarks
- hashtags + post_hashtags
- audit_logs
- reported_content
- analytics_snapshots
- dm_message_reactions

---

## 13. Design Rules (For Copilot)

- Backend enforces permissions
- No polymorphic tables in MVP
- No triggers except updated_at
- No denormalized counters
- No channel real-time messages
- Real-time is ONLY for DMs

---

**End of Spec – Ready for Backend & Frontend Code Generation**

