import { Notification, User } from '../db/models/index.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { Op } from 'sequelize';

/**
 * Notification types
 */
export enum NotificationType {
  POST_COMMENT = 'post_comment',
  POST_REACTION = 'post_reaction',
  CHANNEL_INVITE = 'channel_invite',
  GROUP_INVITE = 'group_invite',
  DM_MESSAGE = 'dm_message',
  POST_MENTION = 'post_mention',
  COMMENT_MENTION = 'comment_mention',
  POST_PINNED = 'post_pinned'
}

/**
 * Get all notifications for a user
 * Ordered by most recent first, with unread notifications first
 */
const getNotifications = async (userId: string): Promise<any[]> => {
  const notifications = await Notification.findAll({
    where: { userId },
    order: [
      ['isRead', 'ASC'], // Unread first
      ['createdAt', 'DESC'] // Most recent first
    ],
    limit: 100 // Limit to last 100 notifications
  });

  return notifications.map(formatNotificationResponse);
};

/**
 * Create a notification (backend only)
 * This should be called internally when events occur
 */
const createNotification = async (
  userId: string,
  type: string,
  referenceId?: string | null
): Promise<any> => {
  // Validate user exists
  const user = await User.findByPk(userId);
  if (!user) {
    throw new ValidationError('User not found');
  }

  // Create notification
  const notification = await Notification.create({
    userId,
    type,
    referenceId: referenceId || null,
    isRead: false
  });

  return formatNotificationResponse(notification);
};

/**
 * Mark a notification as read
 */
const markAsRead = async (notificationId: string, userId: string): Promise<void> => {
  const notification = await Notification.findByPk(notificationId);

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  // Verify notification belongs to user
  if (notification.userId !== userId) {
    throw new ForbiddenError('You do not have permission to update this notification');
  }

  // Mark as read
  notification.isRead = true;
  await notification.save();
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId: string): Promise<void> => {
  await Notification.update(
    { isRead: true },
    {
      where: {
        userId,
        isRead: false
      }
    }
  );
};

/**
 * Get unread notification count for a user
 */
const getUnreadCount = async (userId: string): Promise<number> => {
  return await Notification.count({
    where: {
      userId,
      isRead: false
    }
  });
};

/**
 * Delete a single notification for a user
 */
const deleteNotification = async (notificationId: string, userId: string): Promise<void> => {
  const notification = await Notification.findByPk(notificationId);

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  if (notification.userId !== userId) {
    throw new ForbiddenError('You do not have permission to delete this notification');
  }

  await notification.destroy();
};

/**
 * Delete all notifications for a user
 */
const deleteAllNotifications = async (userId: string): Promise<number> => {
  const deletedCount = await Notification.destroy({
    where: { userId }
  });

  return deletedCount;
};

/**
 * Delete old read notifications (cleanup utility)
 * Can be called periodically to clean up old notifications
 */
const deleteOldNotifications = async (daysOld: number = 30): Promise<number> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await Notification.destroy({
    where: {
      isRead: true,
      createdAt: {
        [Op.lt]: cutoffDate
      }
    }
  });

  return result;
};

/**
 * Format notification response with human-readable message
 */
const formatNotificationResponse = (notification: Notification): any => {
  const typeMessages: Record<string, string> = {
    'post_comment': 'New comment on your post',
    'post_reaction': 'Someone reacted to your post',
    'channel_invite': 'You were invited to a channel',
    'group_invite': 'You were invited to a group',
    'dm_message': 'New direct message',
    'post_mention': 'You were mentioned in a post',
    'comment_mention': 'You were mentioned in a comment',
    'post_pinned': 'A post was pinned'
  };

  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type,
    referenceId: notification.referenceId,
    isRead: notification.isRead,
    // Basic text fields used by the mobile app
    title: 'Notification',
    message: typeMessages[notification.type] || `Notification: ${notification.type}`,
    createdAt: notification.createdAt
  };
};

export default {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  deleteAllNotifications,
  deleteOldNotifications
};
