import { Request, Response } from 'express';
import notificationService from '../services/notification.service.js';
import { ValidationError } from '../utils/errors.js';

/**
 * GET /notifications
 * Get all notifications for the current user
 */
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const notifications = await notificationService.getNotifications(req.user.id);

  res.status(200).json({
    success: true,
    data: notifications
  });
};

/**
 * POST /notifications/:id/read
 * Mark a specific notification as read
 */
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('Notification ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await notificationService.markAsRead(id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Notification marked as read'
  });
};

/**
 * POST /notifications/read-all
 * Mark all notifications as read for the current user
 */
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await notificationService.markAllAsRead(req.user.id);

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
};

/**
 * GET /notifications/unread
 * Get unread notification count for the current user
 */
export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const count = await notificationService.getUnreadCount(req.user.id);

  res.status(200).json({
    success: true,
    data: { count }
  });
};

/**
 * DELETE /notifications/:id
 * Delete a specific notification for the current user
 */
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('Notification ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await notificationService.deleteNotification(id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
};

/**
 * DELETE /notifications
 * Delete all notifications for the current user
 */
export const deleteAllNotifications = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await notificationService.deleteAllNotifications(req.user.id);

  res.status(200).json({
    success: true,
    message: 'All notifications deleted successfully'
  });
};

/**
 * POST /notifications/push-token
 * Register push token for current user
 */
export const registerPushToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const { token, platform } = req.body;

  if (!token || !platform) {
    throw new ValidationError('Token and platform are required');
  }

  await notificationService.registerPushToken(
    req.user.id,
    token,
    platform
  );

  res.status(200).json({
    success: true,
    message: 'Push token registered successfully',
  });
};

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  deleteAllNotifications,
  registerPushToken
};
