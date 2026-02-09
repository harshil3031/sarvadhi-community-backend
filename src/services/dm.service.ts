import { DMConversation, DMParticipant, DMMessage, User } from '../db/models/index.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { Op } from 'sequelize';
import notificationService, { NotificationType } from './notification.service.js';

/**
 * Get all conversations for a user
 */
const getConversations = async (userId: string): Promise<any[]> => {
  // Find all conversations where user is a participant
  const participations = await DMParticipant.findAll({
    where: { userId },
    attributes: ['conversationId']
  });

  const conversationIds = participations.map(p => p.conversationId);

  if (conversationIds.length === 0) {
    return [];
  }

  const conversations = await DMConversation.findAll({
    where: {
      id: conversationIds
    },
    include: [
      {
        model: DMParticipant,
        as: 'participants',
        attributes: ['userId', 'joinedAt'],
        include: [
          {
            model: User,
            attributes: ['id', 'fullName', 'email', 'profilePhotoUrl']
          }
        ]
      },
      {
        model: DMMessage,
        as: 'messages',
        attributes: ['id', 'conversationId', 'senderId', 'content', 'imageUrl', 'isDeleted', 'readAt', 'createdAt'],
        limit: 1,
        separate: true,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'fullName', 'email', 'profilePhotoUrl']
          }
        ]
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  const result = [];
  for (const conv of conversations) {
    const unreadCount = await DMMessage.count({
      where: {
        conversationId: conv.id,
        senderId: { [Op.ne]: userId },
        readAt: null,
        isDeleted: false
      }
    });
    result.push(formatConversationResponse(conv, unreadCount));
  }

  return result;
};

/**
 * Get all messages in a conversation
 */
const getMessages = async (conversationId: string, userId: string): Promise<any[]> => {
  // Verify conversation exists
  const conversation = await DMConversation.findByPk(conversationId);

  if (!conversation) {
    throw new NotFoundError('Conversation not found');
  }

  // Verify user is a participant
  const isParticipant = await DMParticipant.findOne({
    where: { conversationId, userId }
  });

  if (!isParticipant) {
    throw new ForbiddenError('You are not a participant in this conversation');
  }

  // Get non-deleted messages
  const messages = await DMMessage.findAll({
    where: {
      conversationId,
      isDeleted: false
    },
    include: [
      {
        model: User,
        as: 'sender',
        attributes: ['id', 'fullName', 'email', 'profilePhotoUrl']
      }
    ],
    order: [['createdAt', 'ASC']]
  });

  return messages.map(formatMessageResponse);
};

/**
 * Create or get a 1-on-1 conversation between two users
 */
const getOrCreateConversation = async (
  userId1: string,
  userId2: string
): Promise<any> => {
  // Validate users exist
  const user1 = await User.findByPk(userId1);
  const user2 = await User.findByPk(userId2);

  if (!user1 || !user2) {
    throw new ValidationError('One or both users not found');
  }

  // Cannot create conversation with yourself
  if (userId1 === userId2) {
    throw new ValidationError('Cannot create conversation with yourself');
  }

  // Find all conversations where user1 is a participant
  const user1Convs = await DMParticipant.findAll({
    where: { userId: userId1 },
    attributes: ['conversationId']
  });

  const user1ConvIds = user1Convs.map(p => p.conversationId);

  // Find conversations where user2 is also a participant
  let conversationId = null;
  if (user1ConvIds.length > 0) {
    const commonConv = await DMParticipant.findOne({
      where: {
        conversationId: user1ConvIds,
        userId: userId2
      }
    });

    if (commonConv) {
      const convId = commonConv.conversationId;

      // Verify it's a 1-on-1 (only 2 participants)
      const participantCount = await DMParticipant.count({
        where: { conversationId: convId }
      });

      if (participantCount === 2) {
        conversationId = convId;
      }
    }
  }

  if (conversationId) {
    // Return full conversation object with participants
    const fullConversation = await DMConversation.findByPk(conversationId, {
      include: [
        {
          model: DMParticipant,
          as: 'participants',
          attributes: ['userId', 'joinedAt'],
          include: [
            {
              model: User,
              attributes: ['id', 'fullName', 'email', 'profilePhotoUrl']
            }
          ]
        }
      ]
    });

    if (fullConversation) {
      const unreadCount = await DMMessage.count({
        where: {
          conversationId: fullConversation.id,
          senderId: { [Op.ne]: userId1 },
          readAt: null,
          isDeleted: false
        }
      });
      return formatConversationResponse(fullConversation, unreadCount);
    }
  }

  // Create new conversation
  const newConversation = await DMConversation.create({
    isGroup: false
  });

  // Add participants
  await DMParticipant.create({
    conversationId: newConversation.id,
    userId: userId1
  });

  await DMParticipant.create({
    conversationId: newConversation.id,
    userId: userId2
  });

  // Return full conversation object with participants
  const fullConversation = await DMConversation.findByPk(newConversation.id, {
    include: [
      {
        model: DMParticipant,
        as: 'participants',
        attributes: ['userId', 'joinedAt'],
        include: [
          {
            model: User,
            attributes: ['id', 'fullName', 'email', 'profilePhotoUrl']
          }
        ]
      }
    ]
  });

  return formatConversationResponse(fullConversation!, 0);
};

/**
 * Send a message in a conversation
 */
const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  imageUrl?: string | null
): Promise<any> => {
  // Verify conversation exists
  const conversation = await DMConversation.findByPk(conversationId);

  if (!conversation) {
    throw new NotFoundError('Conversation not found');
  }

  // Verify sender is a participant
  const isParticipant = await DMParticipant.findOne({
    where: { conversationId, userId: senderId }
  });

  if (!isParticipant) {
    throw new ForbiddenError('You are not a participant in this conversation');
  }

  // Create message
  const message = await DMMessage.create({
    conversationId,
    senderId,
    content,
    imageUrl: imageUrl || null,
    isDeleted: false
  });

  // 🔔 Notify other participants
  const otherParticipants = await DMParticipant.findAll({
    where: {
      conversationId,
      userId: { [Op.ne]: senderId }
    }
  });

  for (const participant of otherParticipants) {
    try {
      await notificationService.createNotification(
        participant.userId,
        NotificationType.DM_MESSAGE,
        conversationId
      );
    } catch (err) {
      console.error('Failed to create notification for DM:', err);
      // Don't fail the message send if notification fails
    }
  }

  return formatMessageResponse(message);
};

/**
 * Delete a message (soft delete)
 */
const deleteMessage = async (messageId: string, userId: string): Promise<void> => {
  const message = await DMMessage.findByPk(messageId);

  if (!message) {
    throw new NotFoundError('Message not found');
  }

  if (message.isDeleted) {
    throw new NotFoundError('Message already deleted');
  }

  // Only sender can delete
  if (message.senderId !== userId) {
    throw new ForbiddenError('You can only delete your own messages');
  }

  message.isDeleted = true;
  await message.save();
};

/**
 * Format conversation response
 */
const formatConversationResponse = (conversation: DMConversation, unreadCount = 0): any => {
  const messages = (conversation as any).messages || [];
  const lastMessage = messages.length > 0 ? messages[0] : null;

  const formattedLastMessage = lastMessage ? formatMessageResponse(lastMessage as any) : null;

  return {
    id: conversation.id,
    isGroup: conversation.isGroup,
    participants: ((conversation as any).participants || []).map((p: any) => ({
      id: p.User.id,
      fullName: p.User.fullName,
      email: p.User.email,
      avatar: p.User.profilePhotoUrl
    })),
    lastMessage: formattedLastMessage,
    unreadCount: unreadCount,
    // Use last message time as updatedAt fallback to createdAt
    updatedAt: formattedLastMessage?.createdAt || conversation.createdAt,
    createdAt: conversation.createdAt
  };
};

/**
 * Format message response
 */
const formatMessageResponse = (message: DMMessage): any => {
  const sender = (message as any).sender;
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    sender: sender ? {
      id: sender.id,
      fullName: sender.fullName,
      email: sender.email,
      avatar: sender.profilePhotoUrl
    } : null,
    text: (message as any).content,
    imageUrl: message.imageUrl,
    isDeleted: message.isDeleted,
    readAt: (message as any).readAt,
    createdAt: message.createdAt
  };
};

/**
 * Alias for getOrCreateConversation
 */
const createOrGetConversation = getOrCreateConversation;

/**
 * Update a DM message
 */
const updateMessage = async (messageId: string, content: string, senderId: string): Promise<any> => {
  const message = await DMMessage.findByPk(messageId);

  if (!message) {
    throw new NotFoundError('Message not found');
  }

  if (message.senderId !== senderId) {
    throw new ForbiddenError('You can only update your own messages');
  }

  message.content = content;
  await message.save();

  return message;
};

/**
 * Search users by name or email for starting a conversation
 */
const searchUsers = async (query: string, currentUserId: string): Promise<any[]> => {
  if (!query || query.trim() === '') {
    return [];
  }

  // Find users whose name or email contains the query, excluding current user
  const users = await User.findAll({
    where: {
      id: { [Op.ne]: currentUserId }, // Exclude self
      [Op.or]: [
        { fullName: { [Op.iLike]: `%${query}%` } },
        { email: { [Op.iLike]: `%${query}%` } },
      ],
    },
    attributes: ['id', 'fullName', 'email', 'profilePhotoUrl'],
    limit: 20, // limit to 20 results
    order: [['fullName', 'ASC']],
  });

  return users.map(u => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    avatar: u.profilePhotoUrl,
  }));
};


/**
 * Mark all messages in a conversation as read for a user
 */
const markAsRead = async (conversationId: string, userId: string): Promise<void> => {
  // Update all messages where user is NOT the sender and readAt is null
  await DMMessage.update(
    { readAt: new Date() },
    {
      where: {
        conversationId,
        senderId: { [Op.ne]: userId },
        readAt: null
      }
    }
  );
};

export default {
  getConversations,
  getMessages,
  getOrCreateConversation,
  createOrGetConversation,
  sendMessage,
  deleteMessage,
  updateMessage,
  searchUsers,
  markAsRead
};
