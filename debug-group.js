import { v4 as uuid } from 'uuid';
import sequelize from './dist/db/index.js';
import groupService from './dist/services/group.service.js';

// Setup DB
console.log('Setting up database...');
try {
  await sequelize.sync({ force: true });
  console.log('Database synced');
  
  // Create test data
  const User = sequelize.models.User;
  const Group = sequelize.models.Group;
  const GroupMember = sequelize.models.GroupMember;
  
  const userId = uuid();
  const groupId = uuid();
  
  const user = await User.create({
    id: userId,
    email: 'test@test.com',
    password: 'hashedpwd',
    fullName: 'Test User',
    authProvider: 'local'
  });

  const group = await Group.create({
    id: groupId,
    name: 'Test Group',
    description: 'Test',
    createdBy: userId
  });

  await GroupMember.create({
    groupId,
    userId
  });

  console.log('Created test user and group');
  
  // Test getGroupMembers
  try {
    console.log('\nTesting getGroupMembers...');
    const result = await groupService.getGroupMembers(groupId, userId);
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error?.message || error);
    if (error?.stack) console.error('Stack:', error.stack);
  }
} catch (error) {
  console.error('Setup error:', error?.message || error);
}

await sequelize.close();

