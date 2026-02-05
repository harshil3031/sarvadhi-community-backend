import express, { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import * as channelController from '../controllers/channel.controller.js';

const router: Router = express.Router();

/**
 * @route   POST /api/channels
 * @desc    Create channel (Admin/Moderator only)
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'moderator'),
  asyncHandler(channelController.createChannel)
);

/**
 * @route   GET /api/channels
 * @desc    Get all accessible channels
 * @access  Private
 */
router.get('/', authenticate, asyncHandler(channelController.getAccessibleChannels));

/**
 * @route   GET /api/channels/public
 * @desc    Get all public channels
 * @access  Private
 */
router.get('/public', authenticate, asyncHandler(channelController.getPublicChannels));

/**
 * @route   GET /api/channels/:id
 * @desc    Get channel by ID
 * @access  Private
 */
router.get('/:id', authenticate, asyncHandler(channelController.getChannelById));

/**
 * @route   GET /api/channels/:id/members
 * @desc    Get channel members
 * @access  Private
 */
router.get('/:id/members', authenticate, asyncHandler(channelController.getChannelMembers));

/**
 * @route   PUT /api/channels/:id
 * @desc    Update channel
 * @access  Private (creator or admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'moderator'),
  asyncHandler(channelController.updateChannel)
);

/**
 * @route   DELETE /api/channels/:id
 * @desc    Delete channel
 * @access  Private (creator or admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'moderator'),
  asyncHandler(channelController.deleteChannel)
);

/**
 * @route   POST /api/channels/:id/join
 * @desc    Join public channel
 * @access  Private
 */
router.post('/:id/join', authenticate, asyncHandler(channelController.joinChannel));

/**
 * @route   POST /api/channels/:id/leave
 * @desc    Leave channel
 * @access  Private
 */
router.post('/:id/leave', authenticate, asyncHandler(channelController.leaveChannel));

/**
 * @route   POST /api/channels/:id/request
 * @desc    Request to join private channel
 * @access  Private
 */
router.post('/:id/request', authenticate, asyncHandler(channelController.requestJoinChannel));

/**
 * @route   POST /api/channels/:id/approve
 * @desc    Approve join request
 * @access  Private (creator or admin)
 */
router.post(
  '/:id/approve',
  authenticate,
  authorize('admin', 'moderator'),
  asyncHandler(channelController.approveJoinRequest)
);

/**
 * @route   POST /api/channels/:id/invite
 * @desc    Invite user to private channel
 * @access  Private (creator or admin)
 */
router.post(
  '/:id/invite',
  authenticate,
  authorize('admin', 'moderator'),
  asyncHandler(channelController.inviteToChannel)
);

export default router;
