import sequelize from '../db/index.js';
import seedUsers from './01-users.seeder.js';
import seedChannels from './02-channels.seeder.js';
import seedGroups from './03-groups.seeder.js';
import seedPosts from './04-posts.seeder.js';
import seedComments from './05-comments.seeder.js';
import seedReactions from './06-reactions.seeder.js';
import seedDMConversations from './07-dm-conversations.seeder.js';

/**
 * Main Seeder Runner
 * Executes all seeders in the correct order
 */

const runSeeders = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Truncate all tables in reverse order to avoid foreign key constraints
    console.log('🗑️  Cleaning existing data...');
    const tables = [
      'notifications',
      'dm_messages',
      'dm_participants',
      'dm_conversations',
      'post_reactions',
      'comments',
      'posts',
      'group_members',
      'groups',
      'channel_invites',
      'channel_members',
      'channels',
      'users'
    ];

    for (const table of tables) {
      await sequelize.getQueryInterface().bulkDelete(table, {}, {});
    }
    console.log('✅ Existing data cleaned\n');

    // Run seeders in order
    console.log('📝 Running seeders...\n');
    
    await seedUsers();
    await seedChannels();
    await seedGroups();
    await seedPosts();
    await seedComments();
    await seedReactions();
    await seedDMConversations();

    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   - 8 Users (1 admin, 2 moderators, 5 employees)');
    console.log('   - 3 Channels (2 public, 1 private) with memberships');
    console.log('   - 2 Groups with memberships');
    console.log('   - 9 Posts (5 in channels, 4 in groups)');
    console.log('   - 14 Comments');
    console.log('   - 31 Reactions');
    console.log('   - 3 DM Conversations with 9 messages\n');
    console.log('🔑 Test credentials:');
    console.log('   Email: admin@sarvadhi.com (or any user email)');
    console.log('   Password: password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeders
runSeeders();
