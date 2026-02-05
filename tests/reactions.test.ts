import request from 'supertest';
import app from '../src/app.js';
import { TEST_CREDENTIALS, TEST_IDS } from './setup.js';

describe('Reaction Endpoints', () => {
  let authToken: string;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_CREDENTIALS.EMPLOYEE2.email,
        password: TEST_CREDENTIALS.EMPLOYEE2.password,
      });
    authToken = loginResponse.body.data.token;
  });

  describe('GET /api/posts/:postId/reactions', () => {
    it('should get all reactions for a post', async () => {
      const response = await request(app)
        .get(`/api/posts/${TEST_IDS.POST_WELCOME_ID}/reactions`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('emoji');
      expect(response.body.data[0]).toHaveProperty('userId');
      expect(response.body.data[0].postId).toBe(TEST_IDS.POST_WELCOME_ID);
    });
  });

  describe('POST /api/posts/:postId/reactions', () => {
    it('should add a reaction to a post', async () => {
      const response = await request(app)
        .post(`/api/posts/${TEST_IDS.POST_CODE_REVIEW_ID}/reactions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emoji: '🎉',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.emoji).toBe('🎉');
      expect(response.body.data.postId).toBe(TEST_IDS.POST_CODE_REVIEW_ID);
      expect(response.body.data.userId).toBe(TEST_IDS.EMPLOYEE2_ID);
    });
  });

  describe('DELETE /api/posts/:postId/reactions', () => {
    it('should remove a reaction from a post', async () => {
      // First add a reaction
      await request(app)
        .post(`/api/posts/${TEST_IDS.POST_ARCHITECTURE_ID}/reactions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emoji: '👍',
        });

      // Then remove it
      const response = await request(app)
        .delete(`/api/posts/${TEST_IDS.POST_ARCHITECTURE_ID}/reactions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emoji: '👍',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('removed');
    });
  });

  describe('GET /api/posts/:postId/reactions/summary', () => {
    it('should get reaction summary for a post', async () => {
      const response = await request(app)
        .get(`/api/posts/${TEST_IDS.POST_WELCOME_ID}/reactions/summary`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('emoji');
      expect(response.body.data[0]).toHaveProperty('count');
    });
  });
});
