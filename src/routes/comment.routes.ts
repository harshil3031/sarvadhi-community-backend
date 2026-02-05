import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import * as commentController from '../controllers/comment.controller.js';

const router: Router = express.Router();

/**
 * @route   GET /api/comments/post/:postId
 * @desc    Get comments for post
 * @access  Private
 */
router.get('/post/:postId', authenticate, asyncHandler(commentController.getCommentsByPost));

/**
 * @route   POST /api/comments
 * @desc    Create comment on post
 * @access  Private
 */
router.post('/', authenticate, asyncHandler(commentController.createComment));

/**
 * @route   PUT /api/comments/:id
 * @desc    Update comment (author only)
 * @access  Private
 */
router.put('/:id', authenticate, asyncHandler(commentController.updateComment));

/**
 * @route   DELETE /api/comments/:id
 * @desc    Delete comment (author only)
 * @access  Private
 */
router.delete('/:id', authenticate, asyncHandler(commentController.deleteComment));

/**
 * @route   POST /api/posts/:id/comments
 * @desc    Create comment on post (alternative route)
 * @access  Private
 */
router.post('/:id/comments', authenticate, asyncHandler(commentController.createComment));

/**
 * @route   GET /api/posts/:id/comments
 * @desc    Get comments for post (alternative route)
 * @access  Private
 */
router.get('/:id/comments', authenticate, asyncHandler(commentController.getComments));

export default router;
