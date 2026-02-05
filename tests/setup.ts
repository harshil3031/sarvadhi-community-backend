import { beforeAll, afterAll } from '@jest/globals';
import sequelize from '../src/db/index.js';
import seedUsers from '../src/seeders/01-users.seeder.js';
import seedChannels from '../src/seeders/02-channels.seeder.js';
import seedGroups from '../src/seeders/03-groups.seeder.js';
import seedPosts from '../src/seeders/04-posts.seeder.js';
import seedComments from '../src/seeders/05-comments.seeder.js';
import seedReactions from '../src/seeders/06-reactions.seeder.js';
import seedDMConversations from '../src/seeders/07-dm-conversations.seeder.js';

// Setup before all tests
beforeAll(async () => {
  console.log('🧪 Setting up test database...');
  
  // Connect to database
  await sequelize.authenticate();
  
  // Clean existing data
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.bulkDelete('notifications', {});
  await queryInterface.bulkDelete('dm_messages', {});
  await queryInterface.bulkDelete('dm_participants', {});
  await queryInterface.bulkDelete('dm_conversations', {});
  await queryInterface.bulkDelete('post_reactions', {});
  await queryInterface.bulkDelete('comments', {});
  await queryInterface.bulkDelete('posts', {});
  await queryInterface.bulkDelete('group_members', {});
  await queryInterface.bulkDelete('groups', {});
  await queryInterface.bulkDelete('channel_invites', {});
  await queryInterface.bulkDelete('channel_members', {});
  await queryInterface.bulkDelete('channels', {});
  await queryInterface.bulkDelete('users', {});
  
  // Seed test data
  await seedUsers();
  await seedChannels();
  await seedGroups();
  await seedPosts();
  await seedComments();
  await seedReactions();
  await seedDMConversations();
  
  console.log('✅ Test database ready');
});

// Cleanup after all tests
afterAll(async () => {
  console.log('🧹 Cleaning up test database...');
  await sequelize.close();
  console.log('✅ Test database closed');
});

// Test constants - use seeded data IDs
export const TEST_IDS = {
  ADMIN_ID: '11111111-1111-1111-1111-111111111111',
  MODERATOR1_ID: '22222222-2222-2222-2222-222222222222',
  MODERATOR2_ID: '22222222-2222-2222-2222-222222222223',
  EMPLOYEE1_ID: '33333333-3333-3333-3333-333333333331',
  EMPLOYEE2_ID: '33333333-3333-3333-3333-333333333332',
  EMPLOYEE3_ID: '33333333-3333-3333-3333-333333333333',
  EMPLOYEE4_ID: '33333333-3333-3333-3333-333333333334',
  EMPLOYEE5_ID: '33333333-3333-3333-3333-333333333335',
  
  CHANNEL_GENERAL_ID: '44444444-4444-4444-4444-444444444441',
  CHANNEL_ENGINEERING_ID: '44444444-4444-4444-4444-444444444442',
  CHANNEL_LEADERSHIP_ID: '44444444-4444-4444-4444-444444444443',
  
  GROUP_DESIGN_ID: '55555555-5555-5555-5555-555555555551',
  GROUP_BOOK_CLUB_ID: '55555555-5555-5555-5555-555555555552',
  
  POST_WELCOME_ID: '66666666-6666-6666-6666-666666666661',
  POST_FEATURES_ID: '66666666-6666-6666-6666-666666666662',
  POST_CODE_REVIEW_ID: '66666666-6666-6666-6666-666666666663',
  POST_ARCHITECTURE_ID: '66666666-6666-6666-6666-666666666664',
  
  DM_CONVERSATION1_ID: '88888888-8888-8888-8888-888888888881',
  DM_CONVERSATION2_ID: '88888888-8888-8888-8888-888888888882',
  DM_CONVERSATION3_ID: '88888888-8888-8888-8888-888888888883',
};

export const TEST_CREDENTIALS = {
  ADMIN: {
    email: 'admin@sarvadhi.com',
    password: 'password123',
  },
  MODERATOR1: {
    email: 'sarah.johnson@sarvadhi.com',
    password: 'password123',
  },
  EMPLOYEE1: {
    email: 'emily.rodriguez@sarvadhi.com',
    password: 'password123',
  },
  EMPLOYEE2: {
    email: 'david.kim@sarvadhi.com',
    password: 'password123',
  },
};
