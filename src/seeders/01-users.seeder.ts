import bcrypt from 'bcryptjs';
import sequelize from '../db/index.js';

/**
 * User Seeder
 * Creates 1 Admin, 2 Moderators, and 5 Employees
 */

// Deterministic user IDs
export const USER_IDS = {
  admin: '11111111-1111-1111-1111-111111111111',
  moderator1: '22222222-2222-2222-2222-222222222222',
  moderator2: '22222222-2222-2222-2222-222222222223',
  employee1: '33333333-3333-3333-3333-333333333331',
  employee2: '33333333-3333-3333-3333-333333333332',
  employee3: '33333333-3333-3333-3333-333333333333',
  employee4: '33333333-3333-3333-3333-333333333334',
  employee5: '33333333-3333-3333-3333-333333333335'
};

export const seedUsers = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const now = new Date();

  const users = [
    {
      id: USER_IDS.admin,
      full_name: 'Admin User',
      email: 'admin@sarvadhi.com',
      role: 'admin',
      auth_provider: 'local',
      password_hash: hashedPassword,
      google_id: null,
      profile_photo_url: 'https://i.pravatar.cc/150?u=admin',
      department: 'Administration',
      is_active: true,
      last_seen_at: now,
      created_at: now,
      updated_at: now
    },
    {
      id: USER_IDS.moderator1,
      full_name: 'Sarah Johnson',
      email: 'sarah.johnson@sarvadhi.com',
      role: 'moderator',
      auth_provider: 'local',
      password_hash: hashedPassword,
      google_id: null,
      profile_photo_url: 'https://i.pravatar.cc/150?u=sarah',
      department: 'Community',
      is_active: true,
      last_seen_at: now,
      created_at: now,
      updated_at: now
    },
    {
      id: USER_IDS.moderator2,
      full_name: 'Michael Chen',
      email: 'michael.chen@sarvadhi.com',
      role: 'moderator',
      auth_provider: 'local',
      password_hash: hashedPassword,
      google_id: null,
      profile_photo_url: 'https://i.pravatar.cc/150?u=michael',
      department: 'Technology',
      is_active: true,
      last_seen_at: now,
      created_at: now,
      updated_at: now
    },
    {
      id: USER_IDS.employee1,
      full_name: 'Emily Rodriguez',
      email: 'emily.rodriguez@sarvadhi.com',
      role: 'employee',
      auth_provider: 'local',
      password_hash: hashedPassword,
      google_id: null,
      profile_photo_url: 'https://i.pravatar.cc/150?u=emily',
      department: 'Engineering',
      is_active: true,
      last_seen_at: now,
      created_at: now,
      updated_at: now
    },
    {
      id: USER_IDS.employee2,
      full_name: 'David Kim',
      email: 'david.kim@sarvadhi.com',
      role: 'employee',
      auth_provider: 'local',
      password_hash: hashedPassword,
      google_id: null,
      profile_photo_url: 'https://i.pravatar.cc/150?u=david',
      department: 'Design',
      is_active: true,
      last_seen_at: now,
      created_at: now,
      updated_at: now
    },
    {
      id: USER_IDS.employee3,
      full_name: 'Jessica Williams',
      email: 'jessica.williams@sarvadhi.com',
      role: 'employee',
      auth_provider: 'local',
      password_hash: hashedPassword,
      google_id: null,
      profile_photo_url: 'https://i.pravatar.cc/150?u=jessica',
      department: 'Marketing',
      is_active: true,
      last_seen_at: now,
      created_at: now,
      updated_at: now
    },
    {
      id: USER_IDS.employee4,
      full_name: 'James Brown',
      email: 'james.brown@sarvadhi.com',
      role: 'employee',
      auth_provider: 'local',
      password_hash: hashedPassword,
      google_id: null,
      profile_photo_url: 'https://i.pravatar.cc/150?u=james',
      department: 'Data Analytics',
      is_active: true,
      last_seen_at: now,
      created_at: now,
      updated_at: now
    },
    {
      id: USER_IDS.employee5,
      full_name: 'Olivia Martinez',
      email: 'olivia.martinez@sarvadhi.com',
      role: 'employee',
      auth_provider: 'local',
      password_hash: hashedPassword,
      google_id: null,
      profile_photo_url: 'https://i.pravatar.cc/150?u=olivia',
      department: 'Customer Success',
      is_active: true,
      last_seen_at: now,
      created_at: now,
      updated_at: now
    }
  ];

  await sequelize.getQueryInterface().bulkInsert('users', users);
  console.log('✅ Seeded 8 users (1 admin, 2 moderators, 5 employees)');
};

export default seedUsers;
