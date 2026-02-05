import request from 'supertest';
import app from '../src/app.js';
import { TEST_CREDENTIALS } from './setup.js';

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          email: 'test.user@sarvadhi.com',
          password: 'password123',
          department: 'Engineering',
        });

      if (response.status !== 201) {
        console.log('Register error:', response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe('test.user@sarvadhi.com');
      expect(response.body.data.user.fullName).toBe('Test User');
      expect(response.body.data.user.role).toBe('employee');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_CREDENTIALS.ADMIN.email,
          password: TEST_CREDENTIALS.ADMIN.password,
        });

      if (response.status !== 200) {
        console.log('Login error:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(TEST_CREDENTIALS.ADMIN.email);
      expect(response.body.data.user.role).toBe('admin');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile', async () => {
      // First login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_CREDENTIALS.EMPLOYEE1.email,
          password: TEST_CREDENTIALS.EMPLOYEE1.password,
        });

      const token = loginResponse.body.data.token;

      // Get profile
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(TEST_CREDENTIALS.EMPLOYEE1.email);
      expect(response.body.data.user).toHaveProperty('fullName');
      expect(response.body.data.user).toHaveProperty('role');
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile', async () => {
      // First login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_CREDENTIALS.EMPLOYEE1.email,
          password: TEST_CREDENTIALS.EMPLOYEE1.password,
        });

      const token = loginResponse.body.data.token;

      // Update profile
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fullName: 'Emily Rodriguez Updated',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.fullName).toBe('Emily Rodriguez Updated');
    });
  });

  describe('POST /api/auth/google', () => {
    it('should authenticate with Google OAuth token', async () => {
      const response = await request(app)
        .post('/api/auth/google')
        .send({
          idToken: 'mock-google-id-token-for-testing',
        });

      if (response.status !== 200) {
        console.log('Google auth error:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Google authentication successful');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('email');
      expect(response.body.data.user).toHaveProperty('fullName');
      expect(response.body.data.user).toHaveProperty('authProvider');
      expect(response.body.data.user.email).toContain('@sarvadhi.com');
    });

    it('should reject missing idToken', async () => {
      const response = await request(app)
        .post('/api/auth/google')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('idToken is required');
    });

    it('should reject empty idToken', async () => {
      const response = await request(app)
        .post('/api/auth/google')
        .send({
          idToken: '   ',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('idToken must be a non-empty string');
    });
  });
});
