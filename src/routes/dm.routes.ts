import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import * as dmController from '../controllers/dm.controller.js';

const router: Router = express.Router();

/**
 * @route   GET /api/dms/conversations
 * @desc    Get all conversations for current user
 * @access  Private
 */
router.get('/conversations', authenticate, asyncHandler(dmController.getConversations));

/**
 * @route   POST /api/dms/conversations
 * @desc    Create or get existing conversation with another user
 * @access  Private
 */
router.post('/conversations', authenticate, asyncHandler(dmController.createConversation));

/**
 * @route   GET /api/dms/conversations/:conversationId/messages
 * @desc    Get messages in a conversation
 * @access  Private
 */
router.get('/conversations/:conversationId/messages', authenticate, asyncHandler(dmController.getMessages));

/**
 * @route   POST /api/dms/conversations/:conversationId/messages
 * @desc    Send a message in a conversation
 * @access  Private
 */
router.post('/conversations/:conversationId/messages', authenticate, asyncHandler(dmController.sendMessage));

/**
 * @route   PUT /api/dms/messages/:id
 * @desc    Update a message
 * @access  Private
 */
router.put('/messages/:id', authenticate, asyncHandler(dmController.updateMessage));

/**
 * @route   DELETE /api/dms/messages/:id
 * @desc    Delete a message
 * @access  Private
 */
router.delete('/messages/:id', authenticate, asyncHandler(dmController.deleteMessage));

/**
 * @route   GET /api/dms/users/search
 * @desc    Search users by name or email to start a DM
 * @access  Private
 */
router.get('/users/search', authenticate, asyncHandler(dmController.searchUsers));

export default router;
