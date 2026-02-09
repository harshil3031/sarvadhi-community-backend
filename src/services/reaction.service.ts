import { PostReaction, Post, User } from '../db/models/index.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import notificationService, { NotificationType } from './notification.service.js';
import { fn, col } from 'sequelize';

/**
 * Add reaction to a post (one per user)
 */
const addReaction = async (
  postId: string,
  userId: string,
  emoji: string
): Promise<any> => {
  // Verify post exists and is not deleted
  const post = await Post.findByPk(postId);

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  if (post.isDeleted) {
    throw new NotFoundError('Post has been deleted');
  }

  // Verify user exists
  const user = await User.findByPk(userId);
  if (!user) {
    throw new ValidationError('User not found');
  }

  // Check if user already has a reaction on this post
  const existingReaction = await PostReaction.findOne({
    where: { postId, userId }
  });

  if (existingReaction) {
    // Update existing reaction with new emoji
    existingReaction.emoji = emoji;
    await existingReaction.save();

    // 🔔 Notify post author
    if (post.authorId !== userId) {
      try {
        await notificationService.createNotification(
          post.authorId,
          NotificationType.POST_REACTION,
          postId
        );
      } catch (err) {
        console.error('Failed to create notification for reaction update:', err);
      }
    }

    return formatReactionResponse(existingReaction);
  }

  // Create new reaction
  const reaction = await PostReaction.create({
    postId,
    userId,
    emoji
  });

  // 🔔 Notify post author
  if (post.authorId !== userId) {
    try {
      await notificationService.createNotification(
        post.authorId,
        NotificationType.POST_REACTION,
        postId
      );
    } catch (err) {
      console.error('Failed to create notification for reaction:', err);
    }
  }

  return formatReactionResponse(reaction);
};

/**
 * Remove reaction from a post (only your own)
 */
const removeReaction = async (postId: string, userId: string): Promise<void> => {
  // Verify post exists
  const post = await Post.findByPk(postId);

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  // Find and delete user's reaction
  const reaction = await PostReaction.findOne({
    where: { postId, userId }
  });

  if (!reaction) {
    throw new NotFoundError('Reaction not found');
  }

  await reaction.destroy();
};

/**
 * Get all reactions for a post
 */
const getReactionsByPost = async (postId: string): Promise<any[]> => {
  // Verify post exists
  const post = await Post.findByPk(postId);

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  if (post.isDeleted) {
    throw new NotFoundError('Post has been deleted');
  }

  const reactions = await PostReaction.findAll({
    where: { postId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'email', 'profilePhotoUrl']
      }
    ],
    order: [['createdAt', 'ASC']]
  });

  return reactions.map(formatReactionResponse);
};

/**
 * Get reactions summary (grouped by emoji with count)
 */
const getReactionsSummary = async (postId: string): Promise<any[]> => {
  // Verify post exists
  const post = await Post.findByPk(postId);

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  if (post.isDeleted) {
    throw new NotFoundError('Post has been deleted');
  }

  const reactions = await PostReaction.findAll({
    where: { postId },
    attributes: [
      'emoji',
      [fn('COUNT', col('emoji')), 'count']
    ],
    group: ['emoji']
  });

  return reactions.map((r: any) => ({
    emoji: r.emoji,
    count: parseInt(r.get('count') as string, 10)
  }));
};

/**
 * Format reaction response
 */
const formatReactionResponse = (reaction: PostReaction): any => {
  const response: any = {
    postId: reaction.postId,
    userId: reaction.userId,
    emoji: reaction.emoji,
    createdAt: reaction.createdAt
  };

  // Include user details if available
  if ((reaction as any).user) {
    response.user = (reaction as any).user;
  }

  return response;
};

export default {
  addReaction,
  removeReaction,
  getReactionsByPost,
  getReactionsSummary
};
