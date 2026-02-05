import sequelize from '../db/index.js';
import { USER_IDS } from './01-users.seeder.js';
import { POST_IDS } from './04-posts.seeder.js';

/**
 * Reaction Seeder
 * Creates reactions on posts
 */

export const seedReactions = async () => {
  const now = new Date();

  const reactions = [
    // Reactions on General Welcome
    { post_id: POST_IDS.generalWelcome, user_id: USER_IDS.moderator1, emoji: '❤️', created_at: now },
    { post_id: POST_IDS.generalWelcome, user_id: USER_IDS.moderator2, emoji: '🎉', created_at: now },
    { post_id: POST_IDS.generalWelcome, user_id: USER_IDS.employee1, emoji: '👍', created_at: now },
    { post_id: POST_IDS.generalWelcome, user_id: USER_IDS.employee2, emoji: '🙌', created_at: now },
    { post_id: POST_IDS.generalWelcome, user_id: USER_IDS.employee3, emoji: '🎉', created_at: now },
    { post_id: POST_IDS.generalWelcome, user_id: USER_IDS.employee4, emoji: '👍', created_at: now },
    { post_id: POST_IDS.generalWelcome, user_id: USER_IDS.employee5, emoji: '❤️', created_at: now },

    // Reactions on General Announcement
    { post_id: POST_IDS.generalAnnouncement, user_id: USER_IDS.admin, emoji: '🚀', created_at: now },
    { post_id: POST_IDS.generalAnnouncement, user_id: USER_IDS.employee1, emoji: '👀', created_at: now },
    { post_id: POST_IDS.generalAnnouncement, user_id: USER_IDS.employee2, emoji: '🚀', created_at: now },
    { post_id: POST_IDS.generalAnnouncement, user_id: USER_IDS.employee3, emoji: '🔥', created_at: now },

    // Reactions on Engineering Code Review
    { post_id: POST_IDS.engineeringCodeReview, user_id: USER_IDS.moderator1, emoji: '👍', created_at: now },
    { post_id: POST_IDS.engineeringCodeReview, user_id: USER_IDS.moderator2, emoji: '✅', created_at: now },
    { post_id: POST_IDS.engineeringCodeReview, user_id: USER_IDS.employee2, emoji: '👀', created_at: now },
    { post_id: POST_IDS.engineeringCodeReview, user_id: USER_IDS.employee4, emoji: '✅', created_at: now },

    // Reactions on Engineering Architecture
    { post_id: POST_IDS.engineeringArchitecture, user_id: USER_IDS.moderator1, emoji: '🤔', created_at: now },
    { post_id: POST_IDS.engineeringArchitecture, user_id: USER_IDS.moderator2, emoji: '🤔', created_at: now },
    { post_id: POST_IDS.engineeringArchitecture, user_id: USER_IDS.employee1, emoji: '👍', created_at: now },
    { post_id: POST_IDS.engineeringArchitecture, user_id: USER_IDS.employee2, emoji: '🤔', created_at: now },

    // Reactions on Leadership Strategy
    { post_id: POST_IDS.leadershipStrategy, user_id: USER_IDS.moderator1, emoji: '🎯', created_at: now },
    { post_id: POST_IDS.leadershipStrategy, user_id: USER_IDS.moderator2, emoji: '💪', created_at: now },

    // Reactions on Design Figma
    { post_id: POST_IDS.designFigma, user_id: USER_IDS.employee1, emoji: '🔥', created_at: now },
    { post_id: POST_IDS.designFigma, user_id: USER_IDS.employee3, emoji: '😍', created_at: now },

    // Reactions on Design Colors
    { post_id: POST_IDS.designColors, user_id: USER_IDS.employee2, emoji: '👍', created_at: now },
    { post_id: POST_IDS.designColors, user_id: USER_IDS.employee3, emoji: '💯', created_at: now },

    // Reactions on Book Club Current Read
    { post_id: POST_IDS.bookClubCurrentRead, user_id: USER_IDS.employee1, emoji: '📚', created_at: now },
    { post_id: POST_IDS.bookClubCurrentRead, user_id: USER_IDS.employee4, emoji: '📚', created_at: now },
    { post_id: POST_IDS.bookClubCurrentRead, user_id: USER_IDS.employee5, emoji: '👍', created_at: now },
    { post_id: POST_IDS.bookClubCurrentRead, user_id: USER_IDS.moderator2, emoji: '📖', created_at: now },

    // Reactions on Book Recommendation
    { post_id: POST_IDS.bookClubRecommendation, user_id: USER_IDS.employee1, emoji: '💯', created_at: now },
    { post_id: POST_IDS.bookClubRecommendation, user_id: USER_IDS.employee3, emoji: '👍', created_at: now },
    { post_id: POST_IDS.bookClubRecommendation, user_id: USER_IDS.employee5, emoji: '📖', created_at: now }
  ];

  await sequelize.getQueryInterface().bulkInsert('post_reactions', reactions);
  console.log('✅ Seeded 31 reactions on posts');
};

export default seedReactions;
