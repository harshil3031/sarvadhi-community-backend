import request from 'supertest';
import app from '../src/app.js';
import { TEST_CREDENTIALS, TEST_IDS } from './setup.js';

describe('Group Endpoints', () => {
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

  describe('GET /api/groups', () => {
    it('should get all accessible groups', async () => {
      const response = await request(app)
        .get('/api/groups')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('description');
    });
  });

  describe('GET /api/groups/:id', () => {
    it('should get group details', async () => {
      const response = await request(app)
        .get(`/api/groups/${TEST_IDS.GROUP_BOOK_CLUB_ID}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(TEST_IDS.GROUP_BOOK_CLUB_ID);
      expect(response.body.data.name).toBe('Book Club');
    });
  });

  describe('POST /api/groups', () => {
    it('should create a new group', async () => {
      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Group',
          description: 'A test group for testing',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe('Test Group');
      expect(response.body.data.description).toBe('A test group for testing');
      expect(response.body.data.createdBy).toBe(TEST_IDS.EMPLOYEE1_ID);
    });
  });

  describe('GET /api/groups/:id/members', () => {
    it('should get group members', async () => {
      const response = await request(app)
        .get(`/api/groups/${TEST_IDS.GROUP_BOOK_CLUB_ID}/members`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('userId');
      expect(response.body.data[0]).toHaveProperty('user');
    });
  });

  describe('POST /api/groups/:id/join', () => {
    it('should join a group', async () => {
      // First create a new user to test joining
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Group Join Test',
          email: 'group.join@sarvadhi.com',
          password: 'password123',
          department: 'Testing',
        });

      const newUserToken = registerResponse.body.data.token;

      const response = await request(app)
        .post(`/api/groups/${TEST_IDS.GROUP_BOOK_CLUB_ID}/join`)
        .set('Authorization', `Bearer ${newUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Joined');
    });
  });

  describe('POST /api/groups/:id/leave', () => {
    it('should leave a group', async () => {
      const response = await request(app)
        .post(`/api/groups/${TEST_IDS.GROUP_BOOK_CLUB_ID}/leave`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Left');
    });
  });
});
