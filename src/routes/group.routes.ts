import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import * as groupController from '../controllers/group.controller.js';

const router: Router = express.Router();

/**
 * @route   POST /api/groups
 * @desc    Create group
 * @access  Private
 */
router.post('/', authenticate, asyncHandler(groupController.createGroup));

/**
 * @route   GET /api/groups
 * @desc    Get all accessible groups
 * @access  Private
 */
router.get('/', authenticate, asyncHandler(groupController.getAllGroups));

/**
 * @route   GET /api/groups/my
 * @desc    Get user's groups
 * @access  Private
 */
router.get('/my', authenticate, asyncHandler(groupController.getMyGroups));

/**
 * @route   GET /api/groups/:id
 * @desc    Get group by ID
 * @access  Private
 */
router.get('/:id', authenticate, asyncHandler(groupController.getGroupById));

/**
 * @route   GET /api/groups/:id/members
 * @desc    Get group members
 * @access  Private
 */
router.get('/:id/members', authenticate, asyncHandler(groupController.getGroupMembers));

/**
 * @route   PUT /api/groups/:id
 * @desc    Update group (creator only)
 * @access  Private
 */
router.put('/:id', authenticate, asyncHandler(groupController.updateGroup));

/**
 * @route   DELETE /api/groups/:id
 * @desc    Delete group (creator only)
 * @access  Private
 */
router.delete('/:id', authenticate, asyncHandler(groupController.deleteGroup));

/**
 * @route   POST /api/groups/:id/invite
 * @desc    Invite user to group
 * @access  Private
 */
router.post('/:id/invite', authenticate, asyncHandler(groupController.inviteUser));

/**
 * @route   POST /api/groups/:id/join
 * @desc    Join a group
 * @access  Private
 */
router.post('/:id/join', authenticate, asyncHandler(groupController.joinGroup));

/**
 * @route   POST /api/groups/:id/leave
 * @desc    Leave group
 * @access  Private
 */
router.post('/:id/leave', authenticate, asyncHandler(groupController.leaveGroup));

/**
 * @route   POST /api/groups/:id/remove-user
 * @desc    Remove user from group
 * @access  Private
 */
router.post('/:id/remove-user', authenticate, asyncHandler(groupController.removeUser));

export default router;
