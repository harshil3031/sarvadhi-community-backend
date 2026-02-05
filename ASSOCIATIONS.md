# Sequelize Model Associations

## Overview
Associations are defined in `src/db/models/index.ts` following the specification without polymorphic relationships, eager loading defaults, or implicit foreign keys.

## Association Definitions

### User Associations
```typescript
User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
User.hasMany(Comment, { foreignKey: 'authorId', as: 'comments' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
```

**Use Cases:**
```typescript
// Get all posts by a user
const userPosts = await user.getPosts();

// Get all comments by a user
const userComments = await user.getComments();

// Get all notifications for a user
const userNotifications = await user.getNotifications();
```

---

### Channel Associations
```typescript
Channel.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Channel.belongsToMany(User, { through: ChannelMember, foreignKey: 'channelId', otherKey: 'userId' });
Channel.hasMany(Post, { foreignKey: 'channelId' });
```

**Use Cases:**
```typescript
// Get channel creator
const creator = await channel.getCreator();

// Get all members of a channel
const members = await channel.getUsers();

// Get all posts in a channel
const posts = await channel.getPosts();

// Add a user to a channel
await channel.addUser(userId);

// Remove a user from a channel
await channel.removeUser(userId);
```

---

### Group Associations
```typescript
Group.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Group.belongsToMany(User, { through: GroupMember, foreignKey: 'groupId', otherKey: 'userId' });
Group.hasMany(Post, { foreignKey: 'groupId' });
```

**Use Cases:**
```typescript
// Get group creator
const creator = await group.getCreator();

// Get all members of a group
const members = await group.getUsers();

// Get all posts in a group
const posts = await group.getPosts();

// Add a user to a group
await group.addUser(userId);

// Remove a user from a group
await group.removeUser(userId);
```

---

### Post Associations
```typescript
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Post.belongsTo(Channel, { foreignKey: 'channelId' });
Post.belongsTo(Group, { foreignKey: 'groupId' });
Post.hasMany(Comment, { foreignKey: 'postId' });
Post.hasMany(PostReaction, { foreignKey: 'postId' });
```

**Use Cases:**
```typescript
// Get post author
const author = await post.getAuthor();

// Get channel where post was created (if applicable)
const channel = await post.getChannel();

// Get group where post was created (if applicable)
const group = await post.getGroup();

// Get all comments on a post
const comments = await post.getComments();

// Get all reactions on a post
const reactions = await post.getPostReactions();
```

---

### Direct Message Associations
```typescript
DMConversation.hasMany(DMMessage, { foreignKey: 'conversationId' });
DMConversation.belongsToMany(User, { through: DMParticipant, foreignKey: 'conversationId', otherKey: 'userId' });
```

**Use Cases:**
```typescript
// Get all messages in a conversation
const messages = await conversation.getDMMessages();

// Get all participants in a conversation
const participants = await conversation.getUsers();

// Add a user to a DM conversation
await conversation.addUser(userId);

// Remove a user from a DM conversation
await conversation.removeUser(userId);
```

---

### Supporting Join Table Associations
These are defined for explicit access to join table data:

```typescript
// ChannelMember
ChannelMember.belongsTo(Channel, { foreignKey: 'channelId' });
ChannelMember.belongsTo(User, { foreignKey: 'userId' });

// GroupMember
GroupMember.belongsTo(Group, { foreignKey: 'groupId' });
GroupMember.belongsTo(User, { foreignKey: 'userId' });

// Comment (reverse)
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// PostReaction (reverse)
PostReaction.belongsTo(User, { foreignKey: 'userId' });

// DMMessage (reverse)
DMMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// DMParticipant (reverse)
DMParticipant.belongsTo(User, { foreignKey: 'userId' });

// Notification (reverse)
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
```

---

## Association Methods

### hasMany
Generated methods for `User.hasMany(Post, ...)`

| Method | Returns | Example |
|--------|---------|---------|
| `getPosts()` | Promise<Post[]> | `await user.getPosts()` |
| `countPosts()` | Promise<number> | `await user.countPosts()` |
| `createPost(data)` | Promise<Post> | `await user.createPost({ content: '...' })` |
| `addPost(post)` | Promise<void> | `await user.addPost(postId)` |
| `addPosts(posts)` | Promise<void> | `await user.addPosts([...ids])` |
| `removePost(post)` | Promise<void> | `await user.removePost(postId)` |
| `removePosts(posts)` | Promise<void> | `await user.removePosts([...ids])` |
| `hasPosts(posts)` | Promise<boolean> | `await user.hasPosts([...ids])` |

### belongsTo
Generated methods for `Post.belongsTo(User, ...)`

| Method | Returns | Example |
|--------|---------|---------|
| `getAuthor()` | Promise<User \| null> | `await post.getAuthor()` |
| `setAuthor(user)` | Promise<void> | `await post.setAuthor(userId)` |

### belongsToMany
Generated methods for `Channel.belongsToMany(User, ...)`

| Method | Returns | Example |
|--------|---------|---------|
| `getUsers()` | Promise<User[]> | `await channel.getUsers()` |
| `countUsers()` | Promise<number> | `await channel.countUsers()` |
| `addUser(user)` | Promise<void> | `await channel.addUser(userId)` |
| `addUsers(users)` | Promise<void> | `await channel.addUsers([...ids])` |
| `removeUser(user)` | Promise<void> | `await channel.removeUser(userId)` |
| `removeUsers(users)` | Promise<void> | `await channel.removeUsers([...ids])` |
| `hasUser(user)` | Promise<boolean> | `await channel.hasUser(userId)` |
| `hasUsers(users)` | Promise<boolean> | `await channel.hasUsers([...ids])` |
| `setUsers(users)` | Promise<void> | `await channel.setUsers([...ids])` |

---

## Query Examples with Explicit Includes

Since eager loading is not set by default, use `include` for explicit data fetching:

### Get Post with All Related Data
```typescript
const post = await Post.findByPk(postId, {
  include: [
    { model: User, as: 'author', attributes: ['id', 'fullName', 'email'] },
    { model: Channel, attributes: ['id', 'name'] },
    { model: Group, attributes: ['id', 'name'] },
    { model: Comment },
    { model: PostReaction }
  ]
});
```

### Get Channel with Members and Posts
```typescript
const channel = await Channel.findByPk(channelId, {
  include: [
    { model: User, as: 'creator', attributes: ['id', 'fullName'] },
    { 
      model: User, 
      through: { attributes: [] }, // Exclude join table attributes
      attributes: ['id', 'fullName', 'email']
    },
    { 
      model: Post, 
      include: [{ model: User, as: 'author', attributes: ['id', 'fullName'] }]
    }
  ]
});
```

### Get User with All Activity
```typescript
const user = await User.findByPk(userId, {
  include: [
    { model: Post, as: 'posts' },
    { model: Comment, as: 'comments' },
    { model: Notification, as: 'notifications' }
  ]
});
```

### Get DM Conversation with Messages and Participants
```typescript
const conversation = await DMConversation.findByPk(conversationId, {
  include: [
    { model: DMMessage, include: [{ model: User, as: 'sender' }] },
    { 
      model: User,
      through: { attributes: [] },
      attributes: ['id', 'fullName', 'email']
    }
  ]
});
```

---

## Naming Conventions

### Foreign Key Names
- Use snake_case in database: `created_by`, `author_id`, `channel_id`
- Use camelCase in Sequelize models: `createdBy`, `authorId`, `channelId`

### Aliases
Aliases are specified in associations for custom property names:
- `as: 'posts'` - Returns array of posts
- `as: 'author'` - Returns single user as author
- `as: 'creator'` - Returns user who created the entity

### Association Direction
- **One-to-Many**: Parent `hasMany` children
- **Many-to-Many**: `belongsToMany` with join table
- **One-to-One**: `belongsTo` on the child model

---

## Rules Applied

✓ **No polymorphic associations** - Each model has explicit, discrete associations  
✓ **No eager loading defaults** - Must explicitly include related data in queries  
✓ **Explicit foreign keys** - All `foreignKey` values explicitly defined  
✓ **Clear aliases** - Associations use meaningful names (author, creator, etc.)  
✓ **Join tables explicit** - Many-to-many relationships explicitly use through tables  

---

## Association Relationship Map

```
User
├── hasMany(Post)
├── hasMany(Comment)
├── hasMany(Notification)
├── belongsToMany(Channel via ChannelMember)
└── belongsToMany(Group via GroupMember)

Channel
├── belongsTo(User as creator)
├── belongsToMany(User via ChannelMember)
└── hasMany(Post)

Group
├── belongsTo(User as creator)
├── belongsToMany(User via GroupMember)
└── hasMany(Post)

Post
├── belongsTo(User as author)
├── belongsTo(Channel)
├── belongsTo(Group)
├── hasMany(Comment)
└── hasMany(PostReaction)

Comment
└── belongsTo(User as author)

PostReaction
└── belongsTo(User)

DMConversation
├── hasMany(DMMessage)
└── belongsToMany(User via DMParticipant)

DMMessage
└── belongsTo(User as sender)

Notification
└── belongsTo(User)
```

