import sequelize from '../db/index.js';
import { USER_IDS } from './01-users.seeder.js';

/**
 * DM Conversation Seeder
 * Creates DM conversations and messages between users
 */

// Deterministic conversation IDs
export const CONVERSATION_IDS = {
  adminModerator1: '88888888-8888-8888-8888-888888888881',
  employee1Employee2: '88888888-8888-8888-8888-888888888882',
  employee3Employee4: '88888888-8888-8888-8888-888888888883'
};

export const seedDMConversations = async () => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Create conversations
  const conversations = [
    {
      id: CONVERSATION_IDS.adminModerator1,
      created_at: yesterday
    },
    {
      id: CONVERSATION_IDS.employee1Employee2,
      created_at: yesterday
    },
    {
      id: CONVERSATION_IDS.employee3Employee4,
      created_at: yesterday
    }
  ];

  await sequelize.getQueryInterface().bulkInsert('dm_conversations', conversations);

  // Create participants
  const participants = [
    // Admin <-> Moderator1
    { conversation_id: CONVERSATION_IDS.adminModerator1, user_id: USER_IDS.admin, joined_at: yesterday },
    { conversation_id: CONVERSATION_IDS.adminModerator1, user_id: USER_IDS.moderator1, joined_at: yesterday },

    // Employee1 <-> Employee2
    { conversation_id: CONVERSATION_IDS.employee1Employee2, user_id: USER_IDS.employee1, joined_at: yesterday },
    { conversation_id: CONVERSATION_IDS.employee1Employee2, user_id: USER_IDS.employee2, joined_at: yesterday },

    // Employee3 <-> Employee4
    { conversation_id: CONVERSATION_IDS.employee3Employee4, user_id: USER_IDS.employee3, joined_at: yesterday },
    { conversation_id: CONVERSATION_IDS.employee3Employee4, user_id: USER_IDS.employee4, joined_at: yesterday }
  ];

  await sequelize.getQueryInterface().bulkInsert('dm_participants', participants);

  // Create messages
  const messages = [
    // Conversation between Admin and Moderator1
    {
      id: '99999999-9999-9999-9999-999999999991',
      conversation_id: CONVERSATION_IDS.adminModerator1,
      sender_id: USER_IDS.admin,
      content: 'Hey Sarah, wanted to check in on the new features rollout. How\'s it going?',
      is_deleted: false,
      created_at: threeHoursAgo,
    },
    {
      id: '99999999-9999-9999-9999-999999999992',
      conversation_id: CONVERSATION_IDS.adminModerator1,
      sender_id: USER_IDS.moderator1,
      content: 'Going great! The team has been really responsive. We should be ready for launch by end of week.',
      is_deleted: false,
      created_at: twoHoursAgo,
    },
    {
      id: '99999999-9999-9999-9999-999999999993',
      conversation_id: CONVERSATION_IDS.adminModerator1,
      sender_id: USER_IDS.admin,
      content: 'Excellent! Keep me posted if any blockers come up.',
      is_deleted: false,
      created_at: oneHourAgo,
    },

    // Conversation between Employee1 and Employee2
    {
      id: '99999999-9999-9999-9999-999999999994',
      conversation_id: CONVERSATION_IDS.employee1Employee2,
      sender_id: USER_IDS.employee1,
      content: 'Hi David! Love the new Figma components. Mind if I use them in the backend dashboard redesign?',
      is_deleted: false,
      created_at: threeHoursAgo,
    },
    {
      id: '99999999-9999-9999-9999-999999999995',
      conversation_id: CONVERSATION_IDS.employee1Employee2,
      sender_id: USER_IDS.employee2,
      content: 'Of course! That\'s exactly what they\'re for. Let me know if you need any customizations.',
      is_deleted: false,
      created_at: twoHoursAgo,
    },
    {
      id: '99999999-9999-9999-9999-999999999996',
      conversation_id: CONVERSATION_IDS.employee1Employee2,
      sender_id: USER_IDS.employee1,
      content: 'Perfect! I might need a few custom icons. I\'ll send you a list.',
      is_deleted: false,
      created_at: twoHoursAgo,
    },

    // Conversation between Employee3 and Employee4
    {
      id: '99999999-9999-9999-9999-999999999997',
      conversation_id: CONVERSATION_IDS.employee3Employee4,
      sender_id: USER_IDS.employee3,
      content: 'James, are you joining the book club discussion this month?',
      is_deleted: false,
      created_at: threeHoursAgo,
    },
    {
      id: '99999999-9999-9999-9999-999999999998',
      conversation_id: CONVERSATION_IDS.employee3Employee4,
      sender_id: USER_IDS.employee4,
      content: 'Definitely! Just finished the book yesterday. It\'s really insightful.',
      is_deleted: false,
      created_at: threeHoursAgo,
    },
    {
      id: '99999999-9999-9999-9999-999999999999',
      conversation_id: CONVERSATION_IDS.employee3Employee4,
      sender_id: USER_IDS.employee3,
      content: 'Great! Looking forward to hearing your thoughts. See you at the discussion! 📚',
      is_deleted: false,
      created_at: threeHoursAgo,
    }
  ];

  await sequelize.getQueryInterface().bulkInsert('dm_messages', messages);
  console.log('✅ Seeded 3 DM conversations with 9 messages');
};

export default seedDMConversations;
