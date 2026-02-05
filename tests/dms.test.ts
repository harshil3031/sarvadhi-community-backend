import request from 'supertest';
import app from '../src/app.js';
import { TEST_CREDENTIALS, TEST_IDS } from './setup.js';

describe('DM Endpoints', () => {
  let authToken: string;

  beforeAll(async () => {
    // Get employee1 token
    const employee1Login = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_CREDENTIALS.EMPLOYEE1.email,
        password: TEST_CREDENTIALS.EMPLOYEE1.password,
      });
    authToken = employee1Login.body.data.token;
  });

  describe('GET /api/dms/conversations', () => {
    it('should get all conversations for current user', async () => {
      const response = await request(app)
        .get('/api/dms/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('participants');
    });
  });

  describe('POST /api/dms/conversations', () => {
    it('should create a new conversation', async () => {
      const response = await request(app)
        .post('/api/dms/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          participantId: TEST_IDS.EMPLOYEE5_ID,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.participants).toHaveLength(2);
    });
  });

  describe('GET /api/dms/conversations/:id/messages', () => {
    it('should get messages from a conversation', async () => {
      const response = await request(app)
        .get(`/api/dms/conversations/${TEST_IDS.DM_CONVERSATION2_ID}/messages`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('content');
      expect(response.body.data[0]).toHaveProperty('senderId');
      expect(response.body.data[0].conversationId).toBe(TEST_IDS.DM_CONVERSATION2_ID);
    });
  });

  describe('POST /api/dms/conversations/:id/messages', () => {
    it('should send a message in a conversation', async () => {
      const response = await request(app)
        .post(`/api/dms/conversations/${TEST_IDS.DM_CONVERSATION2_ID}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'This is a test DM message',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.content).toBe('This is a test DM message');
      expect(response.body.data.conversationId).toBe(TEST_IDS.DM_CONVERSATION2_ID);
      expect(response.body.data.senderId).toBe(TEST_IDS.EMPLOYEE1_ID);
    });
  });

  describe('PUT /api/dms/messages/:id', () => {
    it('should update a message', async () => {
      // First send a message
      const createResponse = await request(app)
        .post(`/api/dms/conversations/${TEST_IDS.DM_CONVERSATION2_ID}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Original message',
        });

      const messageId = createResponse.body.data.id;

      // Update the message
      const response = await request(app)
        .put(`/api/dms/messages/${messageId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Updated message',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.content).toBe('Updated message');
    });
  });

  describe('DELETE /api/dms/messages/:id', () => {
    it('should delete a message', async () => {
      // First send a message
      const createResponse = await request(app)
        .post(`/api/dms/conversations/${TEST_IDS.DM_CONVERSATION2_ID}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Message to be deleted',
        });

      const messageId = createResponse.body.data.id;

      // Delete the message
      const response = await request(app)
        .delete(`/api/dms/messages/${messageId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted');
    });
  });
});
