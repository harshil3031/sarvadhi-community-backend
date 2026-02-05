import sequelize from '../db/index.js';
import { USER_IDS } from './01-users.seeder.js';
import { CHANNEL_IDS } from './02-channels.seeder.js';
import { GROUP_IDS } from './03-groups.seeder.js';

/**
 * Post Seeder
 * Creates posts in channels and groups
 */

// Deterministic post IDs
export const POST_IDS = {
  // Channel posts
  generalWelcome: '66666666-6666-6666-6666-666666666661',
  generalAnnouncement: '66666666-6666-6666-6666-666666666662',
  engineeringCodeReview: '66666666-6666-6666-6666-666666666663',
  engineeringArchitecture: '66666666-6666-6666-6666-666666666664',
  leadershipStrategy: '66666666-6666-6666-6666-666666666665',
  
  // Group posts
  designFigma: '66666666-6666-6666-6666-666666666671',
  designColors: '66666666-6666-6666-6666-666666666672',
  bookClubCurrentRead: '66666666-6666-6666-6666-666666666673',
  bookClubRecommendation: '66666666-6666-6666-6666-666666666674'
};

export const seedPosts = async () => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  const posts = [
    // General channel posts
    {
      id: POST_IDS.generalWelcome,
      content: '🎉 Welcome to the Sarvadhi Community Platform! This is your space to connect, collaborate, and share ideas. Feel free to introduce yourself and let us know what you\'re working on!',
      author_id: USER_IDS.admin,
      channel_id: CHANNEL_IDS.general,
      group_id: null,
      is_pinned: true,
      is_deleted: false,
      created_at: twoDaysAgo,
      updated_at: twoDaysAgo
    },
    {
      id: POST_IDS.generalAnnouncement,
      content: '📢 Important: We\'re rolling out new features this week! Check out the Engineering channel for technical details. Looking forward to your feedback.',
      author_id: USER_IDS.moderator1,
      channel_id: CHANNEL_IDS.general,
      group_id: null,
      is_pinned: false,
      is_deleted: false,
      created_at: yesterday,
      updated_at: yesterday
    },

    // Engineering channel posts
    {
      id: POST_IDS.engineeringCodeReview,
      content: '🔍 Code Review Request: I\'ve opened a PR for the new authentication flow. Would appreciate reviews from the team. The implementation includes JWT tokens and refresh token rotation.\n\nPR Link: https://github.com/sarvadhi/backend/pull/123',
      author_id: USER_IDS.employee1,
      channel_id: CHANNEL_IDS.engineering,
      group_id: null,
      is_pinned: false,
      is_deleted: false,
      created_at: yesterday,
      updated_at: yesterday
    },
    {
      id: POST_IDS.engineeringArchitecture,
      content: '🏗️ Architecture Discussion: What are your thoughts on migrating to a microservices architecture? I\'ve been researching the pros and cons. Key considerations:\n\n1. Scalability benefits\n2. Independent deployments\n3. Increased complexity\n4. Inter-service communication overhead\n\nWould love to hear everyone\'s perspectives!',
      author_id: USER_IDS.employee4,
      channel_id: CHANNEL_IDS.engineering,
      group_id: null,
      is_pinned: true,
      is_deleted: false,
      created_at: twoDaysAgo,
      updated_at: twoDaysAgo
    },

    // Leadership channel posts
    {
      id: POST_IDS.leadershipStrategy,
      content: '🎯 Q1 Strategic Goals:\n\n1. Increase platform engagement by 30%\n2. Launch mobile apps\n3. Expand team by 5 new hires\n4. Improve customer satisfaction scores\n\nLet\'s discuss priorities and resource allocation in our next meeting.',
      author_id: USER_IDS.admin,
      channel_id: CHANNEL_IDS.leadership,
      group_id: null,
      is_pinned: true,
      is_deleted: false,
      created_at: twoDaysAgo,
      updated_at: twoDaysAgo
    },

    // Design Team group posts
    {
      id: POST_IDS.designFigma,
      content: '🎨 Just finished the new component library in Figma! All the buttons, inputs, and cards are now available with dark mode variants. Check it out and let me know what you think!\n\nFigma link: https://figma.com/file/xyz',
      author_id: USER_IDS.employee2,
      channel_id: null,
      group_id: GROUP_IDS.designTeam,
      is_pinned: false,
      is_deleted: false,
      created_at: yesterday,
      updated_at: yesterday
    },
    {
      id: POST_IDS.designColors,
      content: '🌈 Color Palette Refresh: I\'ve been thinking about updating our brand colors to be more accessible. Current contrast ratios don\'t meet WCAG AA standards. Thoughts?',
      author_id: USER_IDS.employee1,
      channel_id: null,
      group_id: GROUP_IDS.designTeam,
      is_pinned: false,
      is_deleted: false,
      created_at: now,
      updated_at: now
    },

    // Book Club group posts
    {
      id: POST_IDS.bookClubCurrentRead,
      content: '📚 This month\'s book: "The Phoenix Project" by Gene Kim. A great read about DevOps and IT management. We\'ll discuss it at the end of the month. Who\'s in?',
      author_id: USER_IDS.employee3,
      channel_id: null,
      group_id: GROUP_IDS.bookClub,
      is_pinned: true,
      is_deleted: false,
      created_at: twoDaysAgo,
      updated_at: twoDaysAgo
    },
    {
      id: POST_IDS.bookClubRecommendation,
      content: '📖 Just finished "Atomic Habits" by James Clear. Highly recommend for anyone looking to improve their productivity! The 2-minute rule changed my approach to building new habits.',
      author_id: USER_IDS.employee4,
      channel_id: null,
      group_id: GROUP_IDS.bookClub,
      is_pinned: false,
      is_deleted: false,
      created_at: yesterday,
      updated_at: yesterday
    }
  ];

  await sequelize.getQueryInterface().bulkInsert('posts', posts);
  console.log('✅ Seeded 9 posts (5 in channels, 4 in groups)');
};

export default seedPosts;
