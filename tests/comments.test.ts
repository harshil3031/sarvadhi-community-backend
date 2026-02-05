import request from 'supertest';
import app from '../src/app.js';
import { TEST_CREDENTIALS, TEST_IDS } from './setup.js';

describe('Comment Endpoints', () => {
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

  describe('GET /api/comments/post/:postId', () => {
    it('should get all comments for a post', async () => {
      const response = await request(app)
        .get(`/api/comments/post/${TEST_IDS.POST_WELCOME_ID}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('content');
      expect(response.body.data[0]).toHaveProperty('authorId');
      expect(response.body.data[0].postId).toBe(TEST_IDS.POST_WELCOME_ID);
    });
  });

  describe('POST /api/comments', () => {
    it('should create a comment on a post', async () => {
      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'This is a test comment',
          postId: TEST_IDS.POST_WELCOME_ID,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.content).toBe('This is a test comment');
      expect(response.body.data.postId).toBe(TEST_IDS.POST_WELCOME_ID);
      expect(response.body.data.authorId).toBe(TEST_IDS.EMPLOYEE1_ID);
    });
  });

  describe('PUT /api/comments/:id', () => {
    it('should update a comment', async () => {
      // First create a comment
      const createResponse = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Original comment',
          postId: TEST_IDS.POST_WELCOME_ID,
        });

      const commentId = createResponse.body.data.id;

      // Update the comment
      const response = await request(app)
        .put(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Updated comment',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.content).toBe('Updated comment');
    });
  });

  describe('DELETE /api/comments/:id', () => {
    it('should delete a comment', async () => {
      // First create a comment
      const createResponse = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Comment to be deleted',
          postId: TEST_IDS.POST_WELCOME_ID,
        });

      const commentId = createResponse.body.data.id;

      // Delete the comment
      const response = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted');
    });
  });
});
