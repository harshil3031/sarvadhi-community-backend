import sequelize from '../db/index.js';
import { USER_IDS } from './01-users.seeder.js';

/**
 * Group Seeder
 * Creates 2 groups with memberships
 */

// Deterministic group IDs
export const GROUP_IDS = {
  designTeam: '55555555-5555-5555-5555-555555555551',
  bookClub: '55555555-5555-5555-5555-555555555552'
};

export const seedGroups = async () => {
  const now = new Date();

  // Create groups
  const groups = [
    {
      id: GROUP_IDS.designTeam,
      name: 'Design Team',
      description: 'Collaboration space for designers to share ideas, feedback, and resources',
      created_by: USER_IDS.employee2, // David Kim (Product Designer)
      created_at: now
    },
    {
      id: GROUP_IDS.bookClub,
      name: 'Book Club',
      description: 'Monthly book discussions and reading recommendations',
      created_by: USER_IDS.employee3, // Jessica Williams
      created_at: now
    }
  ];

  await sequelize.getQueryInterface().bulkInsert('groups', groups);

  // Create group memberships
  const memberships = [
    // Design Team - creator and interested employees
    { group_id: GROUP_IDS.designTeam, user_id: USER_IDS.employee2, joined_at: now },
    { group_id: GROUP_IDS.designTeam, user_id: USER_IDS.employee1, joined_at: now },
    { group_id: GROUP_IDS.designTeam, user_id: USER_IDS.employee3, joined_at: now },

    // Book Club - creator and various members
    { group_id: GROUP_IDS.bookClub, user_id: USER_IDS.employee3, joined_at: now },
    { group_id: GROUP_IDS.bookClub, user_id: USER_IDS.employee1, joined_at: now },
    { group_id: GROUP_IDS.bookClub, user_id: USER_IDS.employee4, joined_at: now },
    { group_id: GROUP_IDS.bookClub, user_id: USER_IDS.employee5, joined_at: now },
    { group_id: GROUP_IDS.bookClub, user_id: USER_IDS.moderator2, joined_at: now }
  ];

  await sequelize.getQueryInterface().bulkInsert('group_members', memberships);
  console.log('✅ Seeded 2 groups with memberships');
};

export default seedGroups;
