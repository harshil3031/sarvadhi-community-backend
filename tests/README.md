# API Tests

Comprehensive endpoint tests for the Sarvadhi Community Backend API.

## Overview

This test suite uses **Jest** and **Supertest** to test all API endpoints with real database interactions (no mocks). Tests use seeded data for consistency and repeatability.

## Test Structure

```
tests/
├── setup.ts              # Test setup, teardown, and shared constants
├── auth.test.ts          # Authentication endpoints
├── channels.test.ts      # Channel management endpoints
├── groups.test.ts        # Group management endpoints
├── posts.test.ts         # Post CRUD endpoints
├── comments.test.ts      # Comment CRUD endpoints
├── reactions.test.ts     # Post reaction endpoints
└── dms.test.ts          # Direct messaging endpoints
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts
```

## Test Setup

The test suite automatically:

1. **Connects to the database** before all tests
2. **Cleans all tables** to ensure a fresh state
3. **Seeds test data** using the same seeders as development
4. **Closes database connection** after all tests complete

### Seeded Test Data

The following data is available in all tests:

**Users:**
- 1 Admin: `admin@sarvadhi.com`
- 2 Moderators: `sarah.johnson@sarvadhi.com`, `michael.chen@sarvadhi.com`
- 5 Employees: `emily.rodriguez@sarvadhi.com`, `david.kim@sarvadhi.com`, etc.
- Password for all: `password123`

**Channels:**
- General (public, 8 members)
- Engineering (public, 5 members)
- Leadership (private, 3 members)

**Groups:**
- Design Team (3 members)
- Book Club (5 members)

**Content:**
- 9 Posts across channels and groups
- 14 Comments on various posts
- 31 Reactions (various emojis)
- 3 DM Conversations with 9 messages

## Test Coverage

### Auth Module (4 tests)
- ✅ User registration
- ✅ Login with credentials
- ✅ Get current user profile
- ✅ Update user profile

### Channels Module (7 tests)
- ✅ Get all accessible channels
- ✅ Get channel details
- ✅ Create new channel
- ✅ Get channel members
- ✅ Join public channel
- ✅ Leave channel
- ✅ (Private channel access controlled)

### Groups Module (6 tests)
- ✅ Get all accessible groups
- ✅ Get group details
- ✅ Create new group
- ✅ Get group members
- ✅ Join group
- ✅ Leave group

### Posts Module (8 tests)
- ✅ Get all posts
- ✅ Get specific post
- ✅ Create post in channel
- ✅ Create post in group
- ✅ Update post
- ✅ Delete post
- ✅ Get posts by channel
- ✅ Get posts by group

### Comments Module (4 tests)
- ✅ Get comments for a post
- ✅ Create comment
- ✅ Update comment
- ✅ Delete comment

### Reactions Module (4 tests)
- ✅ Get reactions for a post
- ✅ Add reaction
- ✅ Remove reaction
- ✅ Get reaction summary

### DMs Module (6 tests)
- ✅ Get user's conversations
- ✅ Create new conversation
- ✅ Get conversation messages
- ✅ Send message
- ✅ Update message
- ✅ Delete message

**Total: 39 endpoint tests**

## Test Credentials

Use these constants from `setup.ts`:

```typescript
import { TEST_CREDENTIALS, TEST_IDS } from './setup';

// Login as admin
await request(app)
  .post('/api/auth/login')
  .send({
    email: TEST_CREDENTIALS.ADMIN.email,
    password: TEST_CREDENTIALS.ADMIN.password,
  });

// Use seeded IDs
const channelId = TEST_IDS.CHANNEL_GENERAL_ID;
```

## Writing New Tests

### Basic Pattern

```typescript
import request from 'supertest';
import app from '../src/app.js';
import { TEST_CREDENTIALS } from './setup.js';

describe('Feature Endpoints', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login to get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_CREDENTIALS.EMPLOYEE1.email,
        password: TEST_CREDENTIALS.EMPLOYEE1.password,
      });
    authToken = response.body.token;
  });

  it('should perform an action', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('field');
  });
});
```

### Happy Path Testing

These tests focus on **successful scenarios only**:
- Valid authentication
- Authorized access
- Correct data formats
- Expected status codes (200, 201)

Error cases (401, 403, 404, 422, etc.) are not covered in this basic test suite.

## Database Configuration

Tests use the same database configuration as development (from `.env`). Make sure you have:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sarvadhi_community_db
DB_USER=your_user
DB_PASSWORD=your_password
```

⚠️ **Warning**: Tests will **delete all data** in the configured database before running. Use a separate test database in production environments.

## Continuous Integration

To run tests in CI/CD:

1. Set up PostgreSQL database
2. Run migrations: `npm run db:migrate`
3. Run tests: `npm test`

Example GitHub Actions:

```yaml
- name: Run tests
  run: |
    npm run db:migrate
    npm test
  env:
    DB_HOST: localhost
    DB_NAME: test_db
    DB_USER: postgres
    DB_PASSWORD: postgres
```

## Troubleshooting

### Tests fail with "relation does not exist"
- Run migrations: `npm run db:migrate`

### Tests timeout
- Increase `testTimeout` in `jest.config.js`
- Check database connection

### Tests interfere with each other
- Tests use real database, not mocks
- Setup cleans all tables before running
- Each test should be idempotent

### Module resolution errors
- Ensure `.js` extensions in imports (ESM requirement)
- Check `moduleNameMapper` in `jest.config.js`

## Next Steps

Future enhancements:
- Add error scenario tests (401, 403, 404, 422)
- Add validation tests for request bodies
- Add permission/authorization tests
- Add rate limiting tests
- Add pagination tests
- Add search/filter tests
- Separate test database configuration
