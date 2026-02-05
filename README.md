# Sarvadhi Community Backend

A clean, production-ready Node.js backend API for the Sarvadhi Community platform built with TypeScript.

## Tech Stack

- **Runtime**: Node.js with ES Modules
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT

## Project Structure

```
sarvadhi-community-backend/
├── docs/
│   └── sarvadhi_api_db_spec.md    # Complete API & DB specification
├── src/
│   ├── app.ts                      # Express app configuration
│   ├── server.ts                   # Server entry point
│   ├── config/
│   │   └── index.ts                # Environment configuration
│   ├── db/
│   │   ├── index.ts                # Sequelize connection
│   │   └── models/
│   │       └── index.ts            # Models (to be created)
│   ├── middlewares/
│   │   ├── auth.ts                 # JWT authentication
│   │   └── errorHandler.ts        # Error handling
│   ├── routes/
│   │   ├── index.ts                # Main router
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── channel.routes.ts
│   │   ├── group.routes.ts
│   │   ├── post.routes.ts
│   │   ├── comment.routes.ts
│   │   ├── dm.routes.ts
│   │   └── notification.routes.ts
│   ├── controllers/
│   │   └── *.controller.ts         # Route handlers (placeholders)
│   ├── services/
│   │   └── *.service.ts            # Business logic (placeholders)
│   └── utils/
│       ├── errors.ts               # Custom error classes
│       └── jwt.ts                  # JWT utilities
├── dist/                           # Compiled JavaScript (generated)
├── tsconfig.json                   # TypeScript configuration
├── .env.example                    # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

**Option 1: Using DATABASE_URL (Recommended)**
```env
DATABASE_URL=postgresql://username:password@host:port/database
```

**Option 2: Using Individual Fields (Fallback)**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sarvadhi_community
DB_USER=postgres
DB_PASSWORD=your_password
```

Other required variables:
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Environment (development/production)

### 3. Create Database

```bash
# Using psql
createdb sarvadhi_community

# Or connect to PostgreSQL and run:
# CREATE DATABASE sarvadhi_community;
```

### 4. Run the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Build TypeScript**:
```bash
npm run build
```

**Production mode**:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /health` - Server health status

### API Root
- `GET /api` - API information and available endpoints

### Authentication (Public)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Users (Private)
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/search?q=query` - Search users

### Channels (Private)
- `POST /api/channels` - Create channel (Admin/Moderator)
- `GET /api/channels/public` - List public channels
- `GET /api/channels/:id` - Get channel details
- `PUT /api/channels/:id` - Update channel
- `DELETE /api/channels/:id` - Delete channel
- `POST /api/channels/:id/join` - Join public channel
- `POST /api/channels/:id/leave` - Leave channel
- `POST /api/channels/:id/request` - Request to join private channel
- `POST /api/channels/:id/approve` - Approve join request
- `POST /api/channels/:id/invite` - Invite user

### Groups (Private)
- `POST /api/groups` - Create group
- `GET /api/groups/my` - Get user's groups
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/invite` - Invite user
- `POST /api/groups/:id/leave` - Leave group
- `POST /api/groups/:id/remove-user` - Remove user

### Posts (Private)
- `POST /api/posts` - Create post
- `GET /api/posts?channelId=uuid` - Get posts by channel
- `GET /api/posts?groupId=uuid` - Get posts by group
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/pin` - Pin post
- `POST /api/posts/:id/unpin` - Unpin post
- `POST /api/posts/:id/reactions` - Add reaction
- `DELETE /api/posts/:id/reactions` - Remove reaction

### Comments (Private)
- `POST /api/comments/:postId/comments` - Create comment
- `GET /api/comments/:postId/comments` - Get comments
- `DELETE /api/comments/:id` - Delete comment

### Direct Messages (Private)
- `GET /api/dms/conversations` - Get conversations
- `GET /api/dms/:conversationId/messages` - Get messages

### Notifications (Private)
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read

## Features

✅ **TypeScript** with strict type checking  
✅ Clean, production-ready folder structure  
✅ Centralized error handling middleware  
✅ Environment-based configuration (dev/prod)  
✅ Sequelize ORM initialized  
✅ JWT authentication ready  
✅ Security middleware (Helmet, CORS, Rate Limiting)  
✅ Request logging (Morgan)  
✅ ES Modules support  
✅ All routes defined per specification  
✅ Type-safe Express routes and middleware  

## Next Steps

1. **Create Sequelize Models** based on the database schema in the specification
2. **Implement Controllers** for each route
3. **Implement Services** for business logic
4. **Add Input Validation** (e.g., express-validator)
5. **Implement WebSocket** for real-time DMs
6. **Add Tests** (Unit & Integration)
7. **Set up CI/CD Pipeline**

## Database Schema

Refer to `docs/sarvadhi_api_db_spec.md` for the complete database schema including:
- users
- channels & channel_members
- groups & group_members
- posts, comments, post_reactions
- dm_conversations, dm_participants, dm_messages
- notifications

## Error Handling

The API uses a centralized error handling system with custom error classes:
- `ValidationError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `AppError` (custom)

## License

ISC
