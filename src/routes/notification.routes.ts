import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import * as notificationController from '../controllers/notification.controller.js';

const router: Router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for current user
 * @access  Private
 */
router.get('/', authenticate, asyncHandler(notificationController.getNotifications));

/**
 * @route   POST /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.post('/:id/read', authenticate, asyncHandler(notificationController.markAsRead));

/**
 * @route   POST /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.post('/read-all', authenticate, asyncHandler(notificationController.markAllAsRead));

/**
 * @route   GET /api/notifications/unread
 * @desc    Get unread notification count for current user
 * @access  Private
 */
router.get('/unread', authenticate, asyncHandler(notificationController.getUnreadCount));

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a specific notification
 * @access  Private
 */
router.delete('/:id', authenticate, asyncHandler(notificationController.deleteNotification));

/**
 * @route   DELETE /api/notifications
 * @desc    Delete all notifications for current user
 * @access  Private
 */
router.delete('/', authenticate, asyncHandler(notificationController.deleteAllNotifications));

export default router;
