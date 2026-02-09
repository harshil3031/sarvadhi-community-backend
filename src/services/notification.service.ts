import { Notification, User, PushToken, Channel, ChannelInvite, Group } from '../db/models/index.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { Op } from 'sequelize';
import { sendPushNotification } from '../utils/pushNotification.js';
import { emitToUser } from '../socket.js';

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

  // Format all notifications with await
  return Promise.all(notifications.map(n => formatNotificationResponse(n)));
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

  const formatted = await formatNotificationResponse(notification);

  // 🔔 SEND REAL-TIME NOTIFICATION VIA SOCKET
  emitToUser(userId, 'new_notification', formatted);

  // 🔔 SEND PUSH NOTIFICATION
  await sendPushNotification(userId, {
    title: formatted.title,
    body: formatted.message,
    data: {
      type,
      referenceId,
      notificationId: notification.id,
    },
  });

  return formatted;
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
 * Fetches related data (channel name, inviter name, etc.)
 */
const formatNotificationResponse = async (notification: Notification): Promise<any> => {
  let title = 'Notification';
  let message = 'You have a new notification';
  let channelName = '';
  let inviterName = '';

  try {
    // Fetch details based on notification type
    if (notification.type === NotificationType.CHANNEL_INVITE && notification.referenceId) {
      // Fetch channel details
      const channel = await Channel.findByPk(notification.referenceId);
      if (channel) {
        channelName = channel.name;
        title = 'Channel Invitation';
        
        // Fetch inviter details from channel_invites table
        const invite = await ChannelInvite.findOne({
          where: {
            channelId: notification.referenceId,
            invitedUserId: notification.userId,
            status: 'pending'
          },
          include: [{
            model: User,
            as: 'inviter',
            attributes: ['fullName']
          }]
        });
        
        if (invite && invite.inviter) {
          inviterName = invite.inviter.fullName;
          message = `${inviterName} invited you to join "${channelName}"`;
        } else {
          message = `You were invited to join "${channelName}"`;
        }
      }
    } else if (notification.type === NotificationType.GROUP_INVITE && notification.referenceId) {
      // Fetch group details
      const group = await Group.findByPk(notification.referenceId);
      if (group) {
        title = 'Group Invitation';
        message = `You were invited to join "${group.name}"`;
      }
    } else {
      // Default messages for other types
      const typeMessages: Record<string, { title: string; message: string }> = {
        'post_comment': { title: 'New Comment', message: 'Someone commented on your post' },
        'post_reaction': { title: 'New Reaction', message: 'Someone reacted to your post' },
        'dm_message': { title: 'New Message', message: 'You have a new direct message' },
        'post_mention': { title: 'Mention', message: 'You were mentioned in a post' },
        'comment_mention': { title: 'Mention', message: 'You were mentioned in a comment' },
        'post_pinned': { title: 'Pinned Post', message: 'A post was pinned' }
      };
      
      const typeData = typeMessages[notification.type];
      if (typeData) {
        title = typeData.title;
        message = typeData.message;
      }
    }
  } catch (err) {
    console.error('Error formatting notification:', err);
    // Fall back to generic message
    message = `Notification: ${notification.type}`;
  }

  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type,
    referenceId: notification.referenceId,
    relatedId: notification.referenceId, // Map referenceId to relatedId for frontend compatibility
    isRead: notification.isRead,
    title,
    message,
    createdAt: notification.createdAt
  };
};

/**
 * Register or update push token for a user
 */
const registerPushToken = async (
  userId: string,
  token: string,
  platform: 'android' | 'ios'
): Promise<void> => {
  if (!token) {
    throw new ValidationError('Push token is required');
  }

  // Ensure user exists
  const user = await User.findByPk(userId);
  if (!user) {
    throw new ValidationError('User not found');
  }

  // Upsert token (prevents duplicates)
  await PushToken.upsert({
    userId,
    token,
    platform,
    isActive: true,
  });
};

export default {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  deleteAllNotifications,
  deleteOldNotifications,
  registerPushToken
};
