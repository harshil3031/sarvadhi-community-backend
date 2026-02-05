import { Request, Response } from 'express';
import commentService from '../services/comment.service.js';
import { ValidationError } from '../utils/errors.js';

/**
 * POST /posts/:id/comments OR POST /comments
 * Create a comment on a post
 */
export const createComment = async (req: Request, res: Response): Promise<void> => {
  const { id: postIdFromParams } = req.params;
  const { content, postId: postIdFromBody } = req.body;
  
  const postId = postIdFromParams || postIdFromBody;

  if (!postId) {
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

  const comment = await commentService.createComment(postId, req.user.id, content);

  res.status(201).json({
    success: true,
    message: 'Comment created successfully',
    data: comment
  });
};

/**
 * GET /posts/:id/comments
 * Get all comments for a post
 */
export const getComments = async (req: Request, res: Response): Promise<void> => {
  const { id: postId } = req.params;

  if (!postId) {
    throw new ValidationError('Post ID is required');
  }

  const comments = await commentService.getComments(postId);

  res.status(200).json({
    success: true,
    data: { comments }
  });
};

/**
 * DELETE /comments/:id
 * Delete a comment (author only)
 */
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const { id: commentId } = req.params;

  if (!commentId) {
    throw new ValidationError('Comment ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await commentService.deleteComment(commentId, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully'
  });
};

/**
 * GET /comments/post/:postId
 * Get comments for a specific post
 */
export const getCommentsByPost = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;

  if (!postId) {
    throw new ValidationError('postId is required');
  }

  const comments = await commentService.getCommentsForPost(postId);

  res.status(200).json({
    success: true,
    data: comments
  });
};

/**
 * PUT /comments/:id
 * Update a comment (author only)
 */
export const updateComment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ValidationError('content is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const comment = await commentService.updateComment(id, req.user.id, content);

  res.status(200).json({
    success: true,
    data: comment
  });
};

export default {
  createComment,
  getComments,
  deleteComment,
  getCommentsByPost,
  updateComment
};
