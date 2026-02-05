import request from 'supertest';
import app from '../src/app.js';
import { TEST_CREDENTIALS, TEST_IDS } from './setup.js';

describe('Channel Endpoints', () => {
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Get employee token
    const employeeLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_CREDENTIALS.EMPLOYEE1.email,
        password: TEST_CREDENTIALS.EMPLOYEE1.password,
      });
    authToken = employeeLogin.body.data.token;

    // Get admin token
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_CREDENTIALS.ADMIN.email,
        password: TEST_CREDENTIALS.ADMIN.password,
      });
    adminToken = adminLogin.body.data.token;
  });

  describe('GET /api/channels', () => {
    it('should get all accessible channels', async () => {
      const response = await request(app)
        .get('/api/channels')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('type');
    });
  });

  describe('GET /api/channels/:id', () => {
    it('should get channel details', async () => {
      const response = await request(app)
        .get(`/api/channels/${TEST_IDS.CHANNEL_GENERAL_ID}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(TEST_IDS.CHANNEL_GENERAL_ID);
      expect(response.body.data.name).toBe('General');
      expect(response.body.data.type).toBe('public');
    });
  });

  describe('POST /api/channels', () => {
    it('should create a new channel', async () => {
      const response = await request(app)
        .post('/api/channels')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Channel',
          description: 'A test channel',
          type: 'public',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe('Test Channel');
      expect(response.body.data.description).toBe('A test channel');
      expect(response.body.data.type).toBe('public');
    });
  });

  describe('GET /api/channels/:id/members', () => {
    it('should get channel members', async () => {
      const response = await request(app)
        .get(`/api/channels/${TEST_IDS.CHANNEL_GENERAL_ID}/members`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('userId');
      expect(response.body.data[0]).toHaveProperty('user');
    });
  });

  describe('POST /api/channels/:id/join', () => {
    it('should join a public channel', async () => {
      // First create a new user to test joining
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Join Test User',
          email: 'join.test@sarvadhi.com',
          password: 'password123',
          department: 'Testing',
        });

      const newUserToken = registerResponse.body.data.token;

      const response = await request(app)
        .post(`/api/channels/${TEST_IDS.CHANNEL_GENERAL_ID}/join`)
        .set('Authorization', `Bearer ${newUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Joined');
    });
  });

  describe('POST /api/channels/:id/leave', () => {
    it('should leave a channel', async () => {
      const response = await request(app)
        .post(`/api/channels/${TEST_IDS.CHANNEL_ENGINEERING_ID}/leave`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Left');
    });
  });
});
