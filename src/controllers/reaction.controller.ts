import { Request, Response } from 'express';
import reactionService from '../services/reaction.service.js';
import { ValidationError } from '../utils/errors.js';

/**
 * POST /posts/:id/reactions
 * Add a reaction to a post
 */
export const addReaction = async (req: Request, res: Response): Promise<void> => {
  const { id: postId } = req.params;
  const { emoji } = req.body;

  if (!postId) {
    throw new ValidationError('Post ID is required');
  }

  if (!emoji) {
    throw new ValidationError('emoji is required');
  }

  if (typeof emoji !== 'string' || emoji.trim().length === 0) {
    throw new ValidationError('emoji must be a non-empty string');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const reaction = await reactionService.addReaction(postId, req.user.id, emoji);

  res.status(201).json({
    success: true,
    message: 'Reaction added successfully',
    data: reaction
  });
};

/**
 * DELETE /posts/:id/reactions
 * Remove reaction from a post (only your own reaction)
 */
export const removeReaction = async (req: Request, res: Response): Promise<void> => {
  const { id: postId } = req.params;

  if (!postId) {
    throw new ValidationError('Post ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await reactionService.removeReaction(postId, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Reaction removed successfully'
  });
};

/**
 * GET /posts/:postId/reactions
 * Get all reactions for a post
 */
export const getReactionsByPost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const reactions = await reactionService.getReactionsByPost(id);

  res.status(200).json({
    success: true,
    data: reactions
  });
};

/**
 * GET /posts/:postId/reactions/summary
 * Get reaction summary for a post
 */
export const getReactionsSummary = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const summary = await reactionService.getReactionsSummary(id);

  res.status(200).json({
    success: true,
    data: summary
  });
};

export default {
  addReaction,
  removeReaction,
  getReactionsByPost,
  getReactionsSummary
};
