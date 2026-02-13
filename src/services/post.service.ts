import { Post, Channel, ChannelMember, Group, GroupMember, User } from '../db/models/index.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import notificationService, { NotificationType } from './notification.service.js';
import { Op, Sequelize } from 'sequelize';
import { emitToChannel } from '../socket.js';

/**
 * Create a new post
 */
const createPost = async (
  content: string,
  authorId: string,
  channelId: string | null,
  groupId: string | null
): Promise<any> => {
  // Validate author exists
  const author = await User.findByPk(authorId);
  if (!author) {
    throw new ValidationError('Author user not found');
  }

  // Validate channel or group exists and user has access
  if (channelId) {
    const channel = await Channel.findByPk(channelId);
    if (!channel) {
      throw new ValidationError('Channel not found');
    }

    // For private channels, check membership
    if (channel.type === 'private') {
      const isMember = await ChannelMember.findOne({
        where: { channelId, userId: authorId }
      });
      if (!isMember) {
        throw new ForbiddenError('You are not a member of this private channel');
      }
    }
  }

  if (groupId) {
    const group = await Group.findByPk(groupId);
    if (!group) {
      throw new ValidationError('Group not found');
    }

    // Check membership for groups
    const isMember = await GroupMember.findOne({
      where: { groupId, userId: authorId }
    });
    if (!isMember) {
      throw new ForbiddenError('You are not a member of this group');
    }
  }

  // Create post with validation
  const post = await Post.create({
    content,
    authorId,
    channelId,
    groupId,
    isPinned: false,
    isDeleted: false
  });

  const formatted = formatPostResponse(post);

  // Emit real-time updates to channel room
  if (channelId) {
    emitToChannel(channelId, 'channel_post_created', formatted);
  }

  return formatted;
};

/**
 * Get posts by channelId or groupId
 */
const getPosts = async (
  channelId: string | null,
  groupId: string | null,
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<any> => {
  const where: any = { isDeleted: false };

  if (channelId) {
    where.channelId = channelId;

    // Verify channel exists
    const channel = await Channel.findByPk(channelId);
    if (!channel) {
      throw new NotFoundError('Channel not found');
    }

    // For private channels, verify membership
    if (channel.type === 'private') {
      const isMember = await ChannelMember.findOne({
        where: { channelId, userId }
      });
      if (!isMember) {
        throw new ForbiddenError('You do not have access to this private channel');
      }
    }
  } else if (groupId) {
    where.groupId = groupId;

    // Verify group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      throw new NotFoundError('Group not found');
    }

    // Verify membership
    const isMember = await GroupMember.findOne({
      where: { groupId, userId }
    });
    if (!isMember) {
      throw new ForbiddenError('You do not have access to this group');
    }
  } else {
    // Get feed: Posts from channels user is a member of AND groups user is a member of

    // 1. Get joined channels
    const userChannelIds = (await ChannelMember.findAll({
      where: { userId },
      attributes: ['channelId']
    })).map(m => m.channelId);

    // 2. Get joined groups
    const userGroupIds = (await GroupMember.findAll({
      where: { userId },
      attributes: ['groupId']
    })).map(m => m.groupId);

    if (userChannelIds.length === 0 && userGroupIds.length === 0) {
      return { posts: [], total: 0, hasMore: false };
    }

    where[Op.or] = [
      { channelId: { [Op.in]: userChannelIds } },
      { groupId: { [Op.in]: userGroupIds } }
    ];
  }

  const posts = await Post.findAll({
    where,
    attributes: {
      include: [
        [
          Sequelize.literal(`(
            SELECT CAST(COUNT(*) AS INTEGER)
            FROM post_reactions
            WHERE post_reactions.post_id = "Post".id
          )`),
          'reactionCount'
        ],
        [
          Sequelize.literal(`(
            SELECT emoji
            FROM post_reactions
            WHERE post_reactions.post_id = "Post".id
            AND post_reactions.user_id = '${userId}'
            LIMIT 1
          )`),
          'userReaction'
        ]
      ]
    },
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'fullName', 'email', 'profilePhotoUrl']
      }
    ],
    order: [['isPinned', 'DESC'], ['createdAt', 'DESC']],
    limit,
    offset,
  });

  // Check if there are more posts
  // We could do a count, but for performance in feed, maybe just check if we got `limit` items?
  // Let's do a proper count for now to be safe, or just return the array. 
  // The frontend infinite/query needs to know if there's a next page.
  // Converting this to return an object structure implies breaking change for `getPostsByChannel` calls if they use this underlying function?
  // `getPostsByChannel` uses its own `findAll`. This `getPosts` is only called by `getPosts` controller.
  // But wait, `getPosts` controller returns `res.status(200).json({ success: true, data: posts })`.
  // If I change return type here, I must update controller.

  return posts.map(formatPostResponse);
};

/**
 * Update post (author or moderator only)
 */
const updatePost = async (
  postId: string,
  userId: string,
  userRole: string,
  content: string
): Promise<any> => {
  const post = await Post.findByPk(postId);

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  if (post.isDeleted) {
    throw new NotFoundError('Post has been deleted');
  }

  // Only author or moderator can update
  if (post.authorId !== userId && userRole !== 'moderator' && userRole !== 'admin') {
    throw new ForbiddenError('You do not have permission to update this post');
  }

  post.content = content;
  await post.save();

  return formatPostResponse(post);
};

/**
 * Delete post (author or moderator only)
 */
const deletePost = async (
  postId: string,
  userId: string,
  userRole: string
): Promise<void> => {
  const post = await Post.findByPk(postId);

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  if (post.isDeleted) {
    throw new NotFoundError('Post has been deleted');
  }

  // Only author or moderator can delete
  if (post.authorId !== userId && userRole !== 'moderator' && userRole !== 'admin') {
    throw new ForbiddenError('You do not have permission to delete this post');
  }

  // Soft delete
  post.isDeleted = true;
  await post.save();
};

/**
 * Pin post (moderator or admin only)
 */
const pinPost = async (postId: string, userRole: string): Promise<any> => {
  // Only moderator or admin can pin
  if (userRole !== 'moderator' && userRole !== 'admin') {
    throw new ForbiddenError('Only moderators and admins can pin posts');
  }

  const post = await Post.findByPk(postId);

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  if (post.isDeleted) {
    throw new NotFoundError('Post has been deleted');
  }

  post.isPinned = true;
  await post.save();

  // 🔔 Notify author
  try {
    await notificationService.createNotification(
      post.authorId,
      NotificationType.POST_PINNED,
      postId
    );
  } catch (err) {
    console.error('Failed to create notification for pinned post:', err);
  }

  return formatPostResponse(post);
};

/**
 * Unpin post (moderator or admin only)
 */
const unpinPost = async (postId: string, userRole: string): Promise<any> => {
  // Only moderator or admin can unpin
  if (userRole !== 'moderator' && userRole !== 'admin') {
    throw new ForbiddenError('Only moderators and admins can unpin posts');
  }

  const post = await Post.findByPk(postId);

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  if (post.isDeleted) {
    throw new NotFoundError('Post has been deleted');
  }

  post.isPinned = false;
  await post.save();

  return formatPostResponse(post);
};

/**
 * Get post by ID with author information
 */
const getPostById = async (postId: string): Promise<any> => {
  const post = await Post.findByPk(postId, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'fullName', 'email', 'profilePhotoUrl']
      }
    ]
  });

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  if (post.isDeleted) {
    throw new NotFoundError('Post has been deleted');
  }

  return formatPostResponse(post);
};

/**
 * Get posts by channel ID
 */
const getPostsByChannel = async (channelId: string, userId: string): Promise<any[]> => {
  // Verify channel exists
  const channel = await Channel.findByPk(channelId);
  if (!channel) {
    throw new NotFoundError('Channel not found');
  }

  // For private channels, verify membership
  if (channel.type === 'private') {
    const isMember = await ChannelMember.findOne({
      where: { channelId, userId }
    });
    if (!isMember) {
      throw new ForbiddenError('You do not have access to this private channel');
    }
  }

  const posts = await Post.findAll({
    where: {
      channelId,
      isDeleted: false
    },
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'fullName', 'email', 'profilePhotoUrl']
      }
    ],
    order: [['isPinned', 'DESC'], ['createdAt', 'DESC']]
  });

  return posts.map(formatPostResponse);
};

/**
 * Get posts by group ID
 */
const getPostsByGroup = async (groupId: string, userId: string): Promise<any[]> => {
  // Verify group exists
  const group = await Group.findByPk(groupId);
  if (!group) {
    throw new NotFoundError('Group not found');
  }

  // Verify membership
  const isMember = await GroupMember.findOne({
    where: { groupId, userId }
  });
  if (!isMember) {
    throw new ForbiddenError('You do not have access to this group');
  }

  const posts = await Post.findAll({
    where: {
      groupId,
      isDeleted: false
    },
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'fullName', 'email', 'profilePhotoUrl']
      }
    ],
    order: [['isPinned', 'DESC'], ['createdAt', 'DESC']]
  });

  return posts.map(formatPostResponse);
};

/**
 * Get posts by author ID
 */
const getPostsByAuthor = async (authorId: string): Promise<any[]> => {
  const posts = await Post.findAll({
    where: {
      authorId,
      isDeleted: false
    },
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'fullName', 'email', 'profilePhotoUrl']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  return posts.map(formatPostResponse);
};

/**
 * Format post response
 */
const formatPostResponse = (post: Post): any => {
  const response: any = {
    id: post.id,
    content: post.content,
    authorId: post.authorId,
    channelId: post.channelId,
    groupId: post.groupId,
    isPinned: post.isPinned,
    isDeleted: post.isDeleted,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  };

  // Include author details if available
  if ((post as any).author) {
    response.author = (post as any).author;
  }

  // Include reaction data if available
  if ((post as any).dataValues?.reactionCount !== undefined) {
    response.reactionCount = (post as any).dataValues.reactionCount;
  }
  if ((post as any).dataValues?.userReaction !== undefined) {
    response.userReaction = (post as any).dataValues.userReaction;
  }

  return response;
};

export default {
  createPost,
  getPosts,
  getPostById,
  getPostsByChannel,
  getPostsByGroup,
  getPostsByAuthor,
  updatePost,
  deletePost,
  pinPost,
  unpinPost
};
