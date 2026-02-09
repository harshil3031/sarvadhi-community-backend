import { Request, Response } from 'express';
import postService from '../services/post.service.js';
import { ValidationError } from '../utils/errors.js';

/**
 * POST /posts
 * Create a new post in channel or group
 */
export const createPost = async (req: Request, res: Response): Promise<void> => {
  const { content, channelId, groupId } = req.body;

  if (!content) {
    throw new ValidationError('content is required');
  }

  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new ValidationError('content must be a non-empty string');
  }

  if (!channelId && !groupId) {
    throw new ValidationError('Either channelId or groupId is required');
  }

  if (channelId && groupId) {
    throw new ValidationError('Post cannot have both channelId and groupId');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const post = await postService.createPost(
    content,
    req.user.id,
    channelId || null,
    groupId || null
  );

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: post
  });
};

/**
 * GET /posts
 * Get posts by channelId or groupId
 */
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  const { channelId, groupId } = req.query;

  if (channelId && groupId) {
    throw new ValidationError('Cannot filter by both channelId and groupId');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const posts = await postService.getPosts(
    (channelId as string) || null,
    (groupId as string) || null,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: posts
  });
};

/**
 * PUT /posts/:id
 * Update post (author or moderator only)
 */
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { content } = req.body;

  if (!id) {
    throw new ValidationError('Post ID is required');
  }

  if (!content) {
    throw new ValidationError('content is required');
  }

  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new ValidationError('content must be a non-empty string');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const post = await postService.updatePost(id, req.user.id, req.user.role, content);

  res.status(200).json({
    success: true,
    message: 'Post updated successfully',
    data: post
  });
};

/**
 * DELETE /posts/:id
 * Delete post (author or moderator only)
 */
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('Post ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await postService.deletePost(id, req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully'
  });
};

/**
 * POST /posts/:id/pin
 * Pin post (moderator or admin only)
 */
export const pinPost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('Post ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const post = await postService.pinPost(id, req.user.role);

  res.status(200).json({
    success: true,
    message: 'Post pinned successfully',
    data: post
  });
};

/**
 * POST /posts/:id/unpin
 * Unpin post (moderator or admin only)
 */
export const unpinPost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('Post ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const post = await postService.unpinPost(id, req.user.role);

  res.status(200).json({
    success: true,
    message: 'Post unpinned successfully',
    data: post
  });
};

/**
 * GET /posts/:id
 * Get a specific post by ID
 */
export const getPostById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const post = await postService.getPostById(id);

  res.status(200).json({
    success: true,
    data: post
  });
};

/**
 * GET /posts/channel/:channelId
 * Get posts from a specific channel
 */
export const getPostsByChannel = async (req: Request, res: Response): Promise<void> => {
  const { channelId } = req.params;

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const posts = await postService.getPostsByChannel(channelId, req.user.id);

  res.status(200).json({
    success: true,
    data: posts
  });
};

/**
 * GET /posts/group/:groupId
 * Get posts from a specific group
 */
export const getPostsByGroup = async (req: Request, res: Response): Promise<void> => {
  const { groupId } = req.params;

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const posts = await postService.getPostsByGroup(groupId, req.user.id);

  res.status(200).json({
    success: true,
    data: posts
  });
};

/**
 * GET /posts/user/:authorId
 * Get posts by a specific user
 */
export const getPostsByAuthor = async (req: Request, res: Response): Promise<void> => {
  const { authorId } = req.params;

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const posts = await postService.getPostsByAuthor(authorId);

  res.status(200).json({
    success: true,
    data: posts
  });
};

export default {
  createPost,
  getPosts,
  updatePost,
  deletePost,
  pinPost,
  unpinPost,
  getPostById,
  getPostsByChannel,
  getPostsByGroup,
  getPostsByAuthor
};
