import { Request, Response } from 'express';
import dmService from '../services/dm.service.js';
import { ValidationError } from '../utils/errors.js';
import { emitToConversation } from '../socket.js';

/**
 * GET /dms/conversations
 * Get all conversations for the current user
 */
export const getConversations = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const conversations = await dmService.getConversations(req.user.id);

  res.status(200).json({
    success: true,
    data: conversations
  });
};

/**
 * GET /dms/:conversationId/messages
 * Get all messages in a conversation
 */
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  const { conversationId } = req.params;

  if (!conversationId) {
    throw new ValidationError('Conversation ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const messages = await dmService.getMessages(conversationId, req.user.id);

  res.status(200).json({
    success: true,
    data: messages
  });
};

/**
 * POST /dms/conversations
 * Create or get existing conversation
 */
export const createConversation = async (req: Request, res: Response): Promise<void> => {
  // Frontend sends `userId`, keep `participantId` for backward compatibility
  const participantId = req.body.userId || req.body.participantId;

  if (!participantId) {
    throw new ValidationError('userId is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const conversation = await dmService.createOrGetConversation(req.user.id, participantId);

  res.status(201).json({
    success: true,
    data: conversation
  });
};

/**
 * POST /dms/conversations/:conversationId/messages
 * Send a message in a conversation
 */
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  const { conversationId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ValidationError('content is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const message = await dmService.sendMessage(conversationId, req.user.id, content);

  // Broadcast to other participants via socket
  emitToConversation(conversationId, 'receive_message', {
    message,
    conversationId
  });

  res.status(201).json({
    success: true,
    data: message
  });
};

/**
 * POST /dms/:conversationId/read
 * Mark messages as read
 */
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  const { conversationId } = req.params;

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await dmService.markAsRead(conversationId, req.user.id);

  // Broadcast read status via socket
  emitToConversation(conversationId, 'message_read', {
    conversationId,
    userId: req.user.id
  });

  res.status(200).json({
    success: true,
    message: 'Messages marked as read'
  });
};

/**
 * PUT /dms/messages/:id
 * Update a message
 */
export const updateMessage = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ValidationError('content is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const message = await dmService.updateMessage(id, content, req.user.id);

  res.status(200).json({
    success: true,
    data: message
  });
};

/**
 * DELETE /dms/messages/:id
 * Delete a message
 */
export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await dmService.deleteMessage(id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Message deleted successfully'
  });
};

/**
 * Search users to start a 1-on-1 DM
 */
export const searchUsers = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }
  const query = req.query.query as string;
  const currentUserId = req.user.id;

  const users = await dmService.searchUsers(query, currentUserId);
  res.json({ success: true, data: users });
};

export default {
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
  updateMessage,
  deleteMessage,
  searchUsers,
  markAsRead
};
