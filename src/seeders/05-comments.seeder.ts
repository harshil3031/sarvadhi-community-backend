import sequelize from '../db/index.js';
import { USER_IDS } from './01-users.seeder.js';
import { POST_IDS } from './04-posts.seeder.js';

/**
 * Comment Seeder
 * Creates comments on posts
 */

export const seedComments = async () => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

  const comments = [
    // Comments on General Welcome post
    {
      id: '77777777-7777-7777-7777-777777777771',
      content: 'Thanks for the warm welcome! Excited to be part of the team. 👋',
      author_id: USER_IDS.employee1,
      post_id: POST_IDS.generalWelcome,
      is_deleted: false,
      created_at: twoHoursAgo
    },
    {
      id: '77777777-7777-7777-7777-777777777772',
      content: 'Great to have everyone here! Let\'s make this community amazing.',
      author_id: USER_IDS.moderator1,
      post_id: POST_IDS.generalWelcome,
      is_deleted: false,
      created_at: oneHourAgo,
    },

    // Comments on General Announcement
    {
      id: '77777777-7777-7777-7777-777777777773',
      content: 'Looking forward to the new features! Any ETA on the mobile app?',
      author_id: USER_IDS.employee3,
      post_id: POST_IDS.generalAnnouncement,
      is_deleted: false,
      created_at: oneHourAgo,
    },

    // Comments on Engineering Code Review
    {
      id: '77777777-7777-7777-7777-777777777774',
      content: 'Reviewed the PR! The implementation looks solid. Just left a few minor suggestions about error handling.',
      author_id: USER_IDS.employee4,
      post_id: POST_IDS.engineeringCodeReview,
      is_deleted: false,
      created_at: threeHoursAgo,
    },
    {
      id: '77777777-7777-7777-7777-777777777775',
      content: 'Thanks for the review! I\'ll address those comments today.',
      author_id: USER_IDS.employee1,
      post_id: POST_IDS.engineeringCodeReview,
      is_deleted: false,
      created_at: twoHoursAgo,
    },
    {
      id: '77777777-7777-7777-7777-777777777776',
      content: 'Also reviewed - LGTM! 🚀',
      author_id: USER_IDS.moderator2,
      post_id: POST_IDS.engineeringCodeReview,
      is_deleted: false,
      created_at: oneHourAgo,
    },

    // Comments on Engineering Architecture
    {
      id: '77777777-7777-7777-7777-777777777777',
      content: 'I think we should carefully evaluate the complexity trade-off. We\'re not at a scale where microservices would provide immediate benefits.',
      author_id: USER_IDS.moderator1,
      post_id: POST_IDS.engineeringArchitecture,
      is_deleted: false,
      created_at: twoHoursAgo,
    },
    {
      id: '77777777-7777-7777-7777-777777777778',
      content: 'Agreed. Maybe we should focus on modularizing our monolith first?',
      author_id: USER_IDS.employee1,
      post_id: POST_IDS.engineeringArchitecture,
      is_deleted: false,
      created_at: oneHourAgo,
    },

    // Comments on Design Figma
    {
      id: '77777777-7777-7777-7777-777777777779',
      content: 'This looks amazing! The dark mode is so clean. 🌙',
      author_id: USER_IDS.employee1,
      post_id: POST_IDS.designFigma,
      is_deleted: false,
      created_at: threeHoursAgo,
    },
    {
      id: '77777777-7777-7777-7777-777777777780',
      content: 'Love the attention to detail! Can we get these exported to the design system?',
      author_id: USER_IDS.employee3,
      post_id: POST_IDS.designFigma,
      is_deleted: false,
      created_at: twoHoursAgo,
    },

    // Comments on Design Colors
    {
      id: '77777777-7777-7777-7777-777777777781',
      content: 'Great point about accessibility! Let\'s definitely prioritize this.',
      author_id: USER_IDS.employee2,
      post_id: POST_IDS.designColors,
      is_deleted: false,
      created_at: oneHourAgo,
    },

    // Comments on Book Club
    {
      id: '77777777-7777-7777-7777-777777777782',
      content: 'I\'m in! Already halfway through the book. It\'s fascinating how they connect DevOps to business value.',
      author_id: USER_IDS.employee1,
      post_id: POST_IDS.bookClubCurrentRead,
      is_deleted: false,
      created_at: twoHoursAgo,
    },
    {
      id: '77777777-7777-7777-7777-777777777783',
      content: 'Count me in too! 📚',
      author_id: USER_IDS.employee4,
      post_id: POST_IDS.bookClubCurrentRead,
      is_deleted: false,
      created_at: oneHourAgo,
    },

    // Comments on Book Recommendation
    {
      id: '77777777-7777-7777-7777-777777777784',
      content: 'Adding this to my reading list! Thanks for the recommendation.',
      author_id: USER_IDS.employee5,
      post_id: POST_IDS.bookClubRecommendation,
      is_deleted: false,
      created_at: oneHourAgo,
    }
  ];

  await sequelize.getQueryInterface().bulkInsert('comments', comments);
  console.log('✅ Seeded 14 comments on various posts');
};

export default seedComments;
