import sequelize from '../db/index.js';
import { USER_IDS } from './01-users.seeder.js';

/**
 * Channel Seeder
 * Creates 3 channels (2 public, 1 private) with memberships
 */

// Deterministic channel IDs
export const CHANNEL_IDS = {
  general: '44444444-4444-4444-4444-444444444441',
  engineering: '44444444-4444-4444-4444-444444444442',
  leadership: '44444444-4444-4444-4444-444444444443'
};

export const seedChannels = async () => {
  const now = new Date();

  // Create channels
  const channels = [
    {
      id: CHANNEL_IDS.general,
      name: 'General',
      description: 'General discussions and announcements for the entire Sarvadhi community',
      type: 'public',
      created_by: USER_IDS.admin,
      created_at: now,
      updated_at: now
    },
    {
      id: CHANNEL_IDS.engineering,
      name: 'Engineering',
      description: 'Technical discussions, code reviews, and engineering best practices',
      type: 'public',
      created_by: USER_IDS.moderator1,
      created_at: now,
      updated_at: now
    },
    {
      id: CHANNEL_IDS.leadership,
      name: 'Leadership',
      description: 'Private channel for company leadership and strategic discussions',
      type: 'private',
      created_by: USER_IDS.admin,
      created_at: now,
      updated_at: now
    }
  ];

  await sequelize.getQueryInterface().bulkInsert('channels', channels);

  // Create channel memberships
  const memberships = [
    // General channel - all users
    { channel_id: CHANNEL_IDS.general, user_id: USER_IDS.admin, joined_at: now },
    { channel_id: CHANNEL_IDS.general, user_id: USER_IDS.moderator1, joined_at: now },
    { channel_id: CHANNEL_IDS.general, user_id: USER_IDS.moderator2, joined_at: now },
    { channel_id: CHANNEL_IDS.general, user_id: USER_IDS.employee1, joined_at: now },
    { channel_id: CHANNEL_IDS.general, user_id: USER_IDS.employee2, joined_at: now },
    { channel_id: CHANNEL_IDS.general, user_id: USER_IDS.employee3, joined_at: now },
    { channel_id: CHANNEL_IDS.general, user_id: USER_IDS.employee4, joined_at: now },
    { channel_id: CHANNEL_IDS.general, user_id: USER_IDS.employee5, joined_at: now },

    // Engineering channel - moderators and some employees
    { channel_id: CHANNEL_IDS.engineering, user_id: USER_IDS.moderator1, joined_at: now },
    { channel_id: CHANNEL_IDS.engineering, user_id: USER_IDS.moderator2, joined_at: now },
    { channel_id: CHANNEL_IDS.engineering, user_id: USER_IDS.employee1, joined_at: now },
    { channel_id: CHANNEL_IDS.engineering, user_id: USER_IDS.employee2, joined_at: now },
    { channel_id: CHANNEL_IDS.engineering, user_id: USER_IDS.employee4, joined_at: now },

    // Leadership channel - admin and moderators only
    { channel_id: CHANNEL_IDS.leadership, user_id: USER_IDS.admin, joined_at: now },
    { channel_id: CHANNEL_IDS.leadership, user_id: USER_IDS.moderator1, joined_at: now },
    { channel_id: CHANNEL_IDS.leadership, user_id: USER_IDS.moderator2, joined_at: now }
  ];

  await sequelize.getQueryInterface().bulkInsert('channel_members', memberships);
  console.log('✅ Seeded 3 channels with memberships');
};

export default seedChannels;
