import { Request, Response } from 'express';
import channelService from '../services/channel.service.js';
import { ValidationError } from '../utils/errors.js';

/**
 * POST /channels
 * Create a new channel (admin/moderator only)
 */
export const createChannel = async (req: Request, res: Response): Promise<void> => {
  const { name, description, type } = req.body;

  if (!name) {
    throw new ValidationError('name is required');
  }

  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new ValidationError('name must be a non-empty string');
  }

  if (type && !['public', 'private'].includes(type)) {
    throw new ValidationError('type must be "public" or "private"');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const channel = await channelService.createChannel(
    name,
    description || null,
    type || 'public',
    req.user.id
  );

  res.status(201).json({
    success: true,
    message: 'Channel created successfully',
    data: channel
  });
};

/**
 * GET /channels/public
 * Get all public channels
 */
export const getPublicChannels = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const channels = await channelService.getPublicChannels(userId);

  res.status(200).json({
    success: true,
    data: channels
  });
};

/**
 * GET /channels/:id
 * Get channel by ID with member info
 */
export const getChannelById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('Channel ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const channel = await channelService.getChannelById(id, req.user.id);

  res.status(200).json({
    success: true,
    data: channel
  });
};

/**
 * PUT /channels/:id
 * Update channel (creator or admin only)
 */
export const updateChannel = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!id) {
    throw new ValidationError('Channel ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const channel = await channelService.updateChannel(id, req.user.id, req.user.role, {
    name,
    description
  });

  res.status(200).json({
    success: true,
    message: 'Channel updated successfully',
    data: { channel }
  });
};

/**
 * DELETE /channels/:id
 * Delete channel (creator or admin only)
 */
export const deleteChannel = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('Channel ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await channelService.deleteChannel(id, req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    message: 'Channel deleted successfully'
  });
};

/**
 * POST /channels/:id/join
 * Join a public channel
 */
export const joinChannel = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('Channel ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await channelService.joinChannel(id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Joined channel successfully'
  });
};

/**
 * POST /channels/:id/leave
 * Leave a channel
 */
export const leaveChannel = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('Channel ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await channelService.leaveChannel(id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Left channel successfully'
  });
};

/**
 * POST /channels/:id/request
 * Request to join a private channel
 */
export const requestJoinChannel = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('Channel ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await channelService.requestJoinChannel(id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Join request submitted successfully'
  });
};

/**
 * POST /channels/:id/approve
 * Approve a join request (admin/moderator only)
 */
export const approveJoinRequest = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!id) {
    throw new ValidationError('Channel ID is required');
  }

  if (!userId) {
    throw new ValidationError('userId is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await channelService.approveJoinRequest(id, userId, req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    message: 'Join request approved successfully'
  });
};

/**
 * POST /channels/:id/invite
 * Invite user to private channel (admin/moderator only)
 */
export const inviteToChannel = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!id) {
    throw new ValidationError('Channel ID is required');
  }

  if (!userId) {
    throw new ValidationError('userId is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await channelService.inviteToChannel(id, userId, req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    message: 'User invited to channel successfully'
  });
};

/**
 * GET /channels
 * Get all accessible channels for the current user
 */
export const getAccessibleChannels = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const channels = await channelService.getAccessibleChannels(req.user.id);

  res.status(200).json({
    success: true,
    data: channels
  });
};

/**
 * GET /channels/:id/members
 * Get all members of a channel
 */
export const getChannelMembers = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const members = await channelService.getChannelMembers(id);

  res.status(200).json({
    success: true,
    data: members
  });
};

/**
 * GET /channels/search
 * Search channels
 */
export const searchChannels = async (req: Request, res: Response): Promise<void> => {
  const { q } = req.query;
  const query = q as string;

  if (!query) {
    res.status(200).json({
      success: true,
      data: []
    });
    return;
  }

  const channels = await channelService.searchChannels(query, req.user?.id);

  res.status(200).json({
    success: true,
    data: channels
  });
};

/**
 * POST /channels/:id/remove-member
 * Remove a member from a channel (admin/moderator only)
 */
export const removeMember = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!id) {
    throw new ValidationError('Channel ID is required');
  }

  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await channelService.removeMember(id, userId, req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    message: 'Member removed successfully'
  });
};

/**
 * POST /channels/:id/accept-invite
 * Accept a channel invitation
 */
export const acceptInvite = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('Channel ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await channelService.acceptInvite(id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Invitation accepted successfully'
  });
};

/**
 * POST /channels/:id/reject-invite
 * Reject a channel invitation
 */
export const rejectInvite = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('Channel ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await channelService.rejectInvite(id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Invitation rejected successfully'
  });
};

export default {
  createChannel,
  getPublicChannels,
  getChannelById,
  updateChannel,
  deleteChannel,
  joinChannel,
  leaveChannel,
  requestJoinChannel,
  approveJoinRequest,
  inviteToChannel,
  getAccessibleChannels,
  getChannelMembers,
  searchChannels,
  removeMember,
  acceptInvite,
  rejectInvite
};
