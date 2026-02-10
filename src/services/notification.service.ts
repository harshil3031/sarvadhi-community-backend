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
 * Group similar notifications from the same reference within a time window
 * Useful for combining multiple reactions/comments on the same post
 */
const groupSimilarNotifications = (notifications: any[]): any[] => {
  const grouped: any[] = [];
  const groupMap = new Map<string, any>();
  const timeWindowMs = 5 * 60 * 1000; // 5 minute window

  for (const notif of notifications) {
    // Create group key based on type and referenceId
    const groupKey = `${notif.type}:${notif.referenceId || 'none'}`;
    
    if (groupMap.has(groupKey)) {
      const existing = groupMap.get(groupKey);
      const timeDiff = new Date(notif.createdAt).getTime() - new Date(existing.createdAt).getTime();
      
      // If within time window, increment count
      if (Math.abs(timeDiff) < timeWindowMs) {
        existing.groupCount = (existing.groupCount || 1) + 1;
        existing.lastUpdated = notif.createdAt;
        continue;
      }
    }
    
    // New group or outside time window
    notif.groupCount = 1;
    grouped.push(notif);
    groupMap.set(groupKey, notif);
  }

  return grouped;
};

/**
 * Get all notifications for a user
 * Ordered by most recent first, with unread notifications first
 * Groups similar notifications for better UX
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
  const formatted = await Promise.all(notifications.map(n => formatNotificationResponse(n)));
  
  // Group similar notifications within time window
  return groupSimilarNotifications(formatted);
};

/**
 * Create a notification (backend only)
 * This should be called internally when events occur
 */
const createNotification = async (
  userId: string,
  type: string,
  referenceId?: string | null,
  senderInfo?: any
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

  const formatted = await formatNotificationResponse(notification, senderInfo);

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
      senderName: senderInfo?.fullName || null,
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
const formatNotificationResponse = async (notification: Notification, senderInfo?: any): Promise<any> => {
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
          title = inviterName;
          message = `${inviterName} invited you to join "${channelName}"`;
        } else {
          message = `You were invited to join "${channelName}"`;
        }
      }
    } else if (notification.type === NotificationType.GROUP_INVITE && notification.referenceId) {
      // Fetch group details
      const group = await Group.findByPk(notification.referenceId);
      if (group) {
        title = senderInfo?.fullName || 'Group Invitation';
        message = senderInfo?.fullName
          ? `${senderInfo.fullName} invited you to join "${group.name}"`
          : `You were invited to join "${group.name}"`;
      }
    } else if (notification.type === NotificationType.DM_MESSAGE && senderInfo?.fullName) {
      // DM message with sender info
      title = senderInfo.fullName;
      message = 'Sent you a message';
    } else if (notification.type === NotificationType.POST_COMMENT && senderInfo?.fullName) {
      title = senderInfo.fullName;
      message = 'commented on your post';
    } else if (notification.type === NotificationType.POST_REACTION && senderInfo?.fullName) {
      title = senderInfo.fullName;
      message = 'reacted to your post';
    } else {
      // Default messages for other types (with grouping support)
      const typeMessages: Record<string, { title: string; message: string }> = {
        'post_comment': { title: 'New Comments', message: 'Someone commented on your post' },
        'post_reaction': { title: 'New Reactions', message: 'Someone reacted to your post' },
        'dm_message': { title: 'New Message', message: 'You have a new direct message' },
        'post_mention': { title: 'Mentions', message: 'You were mentioned in a post' },
        'comment_mention': { title: 'Mentions', message: 'You were mentioned in a comment' },
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

  // Handle grouped notifications
  const groupCount = (notification as any).groupCount || 1;
  if (groupCount > 1) {
    // Update title/message for grouped notifications
    if (notification.type === NotificationType.POST_REACTION) {
      title = 'New Reactions';
      message = `${groupCount} people reacted to your post`;
    } else if (notification.type === NotificationType.POST_COMMENT) {
      title = 'New Comments';
      message = `${groupCount} new comments on your post`;
    } else if (notification.type === NotificationType.POST_MENTION) {
      title = 'Mentions';
      message = `${groupCount} new mentions in posts`;
    } else if (notification.type === NotificationType.COMMENT_MENTION) {
      title = 'Mentions';
      message = `${groupCount} new mentions in comments`;
    }
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
    createdAt: notification.createdAt,
    groupCount: groupCount // Include group count for frontend display
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

/**
 * Send a test push notification to a user
 */
const sendTestPush = async (
  userId: string,
  title?: string,
  body?: string
): Promise<void> => {
  await sendPushNotification(userId, {
    title: title || 'Test Notification',
    body: body || 'This is a test push notification',
    data: {
      type: 'test',
      referenceId: null,
    },
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
  registerPushToken,
  sendTestPush
};
