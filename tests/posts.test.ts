import request from 'supertest';
import app from '../src/app.js';
import { TEST_CREDENTIALS, TEST_IDS } from './setup.js';

describe('Post Endpoints', () => {
  let authToken: string;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_CREDENTIALS.EMPLOYEE1.email,
        password: TEST_CREDENTIALS.EMPLOYEE1.password,
      });
    authToken = loginResponse.body.data.token;
  });

  describe('GET /api/posts', () => {
    it('should get all posts from accessible channels/groups', async () => {
      const response = await request(app)
        .get('/api/posts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('content');
      expect(response.body.data[0]).toHaveProperty('authorId');
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should get a specific post', async () => {
      const response = await request(app)
        .get(`/api/posts/${TEST_IDS.POST_WELCOME_ID}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(TEST_IDS.POST_WELCOME_ID);
      expect(response.body.data).toHaveProperty('content');
      expect(response.body.data).toHaveProperty('author');
    });
  });

  describe('POST /api/posts', () => {
    it('should create a post in a channel', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'This is a test post in a channel',
          channelId: TEST_IDS.CHANNEL_GENERAL_ID,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.content).toBe('This is a test post in a channel');
      expect(response.body.data.channelId).toBe(TEST_IDS.CHANNEL_GENERAL_ID);
      expect(response.body.data.groupId).toBeNull();
    });

    it('should create a post in a group', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'This is a test post in a group',
          groupId: TEST_IDS.GROUP_BOOK_CLUB_ID,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.content).toBe('This is a test post in a group');
      expect(response.body.data.groupId).toBe(TEST_IDS.GROUP_BOOK_CLUB_ID);
      expect(response.body.data.channelId).toBeNull();
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update a post', async () => {
      // First create a post
      const createResponse = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Original content',
          channelId: TEST_IDS.CHANNEL_GENERAL_ID,
        });

      const postId = createResponse.body.data.id;

      // Update the post
      const response = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Updated content',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.content).toBe('Updated content');
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete a post', async () => {
      // First create a post
      const createResponse = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Post to be deleted',
          channelId: TEST_IDS.CHANNEL_GENERAL_ID,
        });

      const postId = createResponse.body.data.id;

      // Delete the post
      const response = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted');
    });
  });

  describe('GET /api/posts/channel/:channelId', () => {
    it('should get posts from a specific channel', async () => {
      const response = await request(app)
        .get(`/api/posts/channel/${TEST_IDS.CHANNEL_GENERAL_ID}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((post: any) => {
        expect(post.channelId).toBe(TEST_IDS.CHANNEL_GENERAL_ID);
      });
    });
  });

  describe('GET /api/posts/group/:groupId', () => {
    it('should get posts from a specific group', async () => {
      const response = await request(app)
        .get(`/api/posts/group/${TEST_IDS.GROUP_BOOK_CLUB_ID}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((post: any) => {
        expect(post.groupId).toBe(TEST_IDS.GROUP_BOOK_CLUB_ID);
      });
    });
  });
});
