import express, { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import * as postController from '../controllers/post.controller.js';
import * as reactionController from '../controllers/reaction.controller.js';

const router: Router = express.Router();

/**
 * @route   POST /api/posts
 * @desc    Create post (in channel or group)
 * @access  Private
 */
router.post('/', authenticate, asyncHandler(postController.createPost));

/**
 * @route   GET /api/posts
 * @desc    Get posts by channelId or groupId
 * @access  Private
 */
router.get('/', authenticate, asyncHandler(postController.getPosts));

/**
 * @route   GET /api/posts/:id
 * @desc    Get a specific post by ID
 * @access  Private
 */
router.get('/:id', authenticate, asyncHandler(postController.getPostById));

/**
 * @route   GET /api/posts/channel/:channelId
 * @desc    Get posts from a specific channel
 * @access  Private
 */
router.get('/channel/:channelId', authenticate, asyncHandler(postController.getPostsByChannel));

/**
 * @route   GET /api/posts/group/:groupId
 * @desc    Get posts from a specific group
 * @access  Private
 */
router.get('/group/:groupId', authenticate, asyncHandler(postController.getPostsByGroup));

/**
 * @route   GET /api/posts/user/:authorId
 * @desc    Get posts from a specific user
 * @access  Private
 */
router.get('/user/:authorId', authenticate, asyncHandler(postController.getPostsByAuthor));

/**
 * @route   PUT /api/posts/:id
 * @desc    Update post (author or moderator)
 * @access  Private
 */
router.put('/:id', authenticate, asyncHandler(postController.updatePost));

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete post (author or moderator)
 * @access  Private
 */
router.delete('/:id', authenticate, asyncHandler(postController.deletePost));

/**
 * @route   POST /api/posts/:id/pin
 * @desc    Pin post
 * @access  Private (Admin/Moderator)
 */
router.post(
  '/:id/pin',
  authenticate,
  authorize('admin', 'moderator'),
  asyncHandler(postController.pinPost)
);

/**
 * @route   POST /api/posts/:id/unpin
 * @desc    Unpin post
 * @access  Private (Admin/Moderator)
 */
router.post(
  '/:id/unpin',
  authenticate,
  authorize('admin', 'moderator'),
  asyncHandler(postController.unpinPost)
);

/**
 * @route   GET /api/posts/:id/reactions
 * @desc    Get all reactions for a post
 * @access  Private
 */
router.get('/:id/reactions', authenticate, asyncHandler(reactionController.getReactionsByPost));

/**
 * @route   GET /api/posts/:id/reactions/summary
 * @desc    Get reactions summary for a post
 * @access  Private
 */
router.get('/:id/reactions/summary', authenticate, asyncHandler(reactionController.getReactionsSummary));

/**
 * @route   POST /api/posts/:id/reactions
 * @desc    Add reaction to post
 * @access  Private
 */
router.post('/:id/reactions', authenticate, asyncHandler(reactionController.addReaction));

/**
 * @route   DELETE /api/posts/:id/reactions
 * @desc    Remove reaction from post
 * @access  Private
 */
router.delete('/:id/reactions', authenticate, asyncHandler(reactionController.removeReaction));

export default router;
