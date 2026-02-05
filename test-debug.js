import request from 'supertest';
import app from './src/app.js';
import sequelize from './src/db/index.js';

// Setup DB
await sequelize.sync({ force: true });

// Seed basic user
const User = sequelize.models.User;
const user = await User.create({
  id: 'test-user-1',
  email: 'test@test.com',
  password: 'hashedpwd',
  fullName: 'Test User'
});

// Test group GET
const response = await request(app)
  .get('/api/groups')
  .set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtdXNlci0xIn0.test`);

console.log('Status:', response.status);
console.log('Body:', JSON.stringify(response.body, null, 2));

await sequelize.close();
