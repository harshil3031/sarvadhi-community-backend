import { Channel, ChannelMember, ChannelInvite, User } from '../db/models/index.js';
import { ValidationError, NotFoundError, ForbiddenError, ConflictError } from '../utils/errors.js';
import { fn, col } from 'sequelize';

/**
 * Create a new channel
 */
const createChannel = async (
  name: string,
  description: string | null,
  type: 'public' | 'private',
  createdBy: string
): Promise<any> => {
  // Validate creator exists
  const creator = await User.findByPk(createdBy);
  if (!creator) {
    throw new ValidationError('Creator user not found');
  }

  // Create channel
  const channel = await Channel.create({
    name,
    description,
    type,
    createdBy
  });

  // Add creator as first member
  await ChannelMember.create({
    channelId: channel.id,
    userId: createdBy
  });

  return formatChannelResponse(channel);
};

/**
 * Get all public channels
 */
const getPublicChannels = async (userId?: string): Promise<any[]> => {
  const channels = await Channel.findAll({
    where: { type: 'public', deletedAt: null },
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'fullName', 'email']
      },
      {
        model: ChannelMember,
        as: 'channel_members',
        attributes: [],
        duplicating: false
      }
    ],
    attributes: {
      include: [
        [
          // Count members without including them in results
          fn('COUNT', col('channel_members.user_id')),
          'memberCount'
        ]
      ]
    },
    group: ['Channel.id', 'creator.id'],
    order: [['createdAt', 'DESC']]
  });

  // Check membership for each channel if userId provided
  if (userId) {
    const channelsWithMembership = await Promise.all(
      channels.map(async (channel) => {
        const isMember = await ChannelMember.findOne({
          where: { channelId: channel.id, userId }
        });
        const formatted = formatChannelResponse(channel);
        return {
          ...formatted,
          isMember: !!isMember,
          memberCount: (channel as any).getDataValue('memberCount') || 0
        };
      })
    );
    return channelsWithMembership;
  }

  return channels.map((channel) => ({
    ...formatChannelResponse(channel),
    memberCount: (channel as any).getDataValue('memberCount') || 0
  }));
};

/**
 * Get channel by ID with member information
 */
const getChannelById = async (channelId: string, userId: string): Promise<any> => {
  const channel = await Channel.findByPk(channelId, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'fullName', 'email']
      }
    ]
  });

  if (!channel) {
    throw new NotFoundError('Channel not found');
  }

  // Check if user is member
  const isMember = await ChannelMember.findOne({
    where: { channelId, userId }
  });

  // For private channels, only members can view
  if (channel.type === 'private' && !isMember) {
    throw new ForbiddenError('Access denied to this private channel');
  }

  // Get member count
  const memberCount = await ChannelMember.count({
    where: { channelId }
  });

  const response = formatChannelResponse(channel);
  return {
    ...response,
    isMember: !!isMember,
    memberCount
  };
};

/**
 * Update channel
 */
const updateChannel = async (
  channelId: string,
  userId: string,
  userRole: string,
  updates: { name?: string; description?: string }
): Promise<any> => {
  const channel = await Channel.findByPk(channelId);

  if (!channel) {
    throw new NotFoundError('Channel not found');
  }

  // Only creator or admin can update
  if (channel.createdBy !== userId && userRole !== 'admin') {
    throw new ForbiddenError('Only channel creator or admin can update channel');
  }

  // Update fields
  if (updates.name) {
    channel.name = updates.name;
  }
  if (updates.description !== undefined) {
    channel.description = updates.description;
  }

  await channel.save();

  return formatChannelResponse(channel);
};

/**
 * Delete channel (soft delete via paranoid)
 */
const deleteChannel = async (
  channelId: string,
  userId: string,
  userRole: string
): Promise<void> => {
  const channel = await Channel.findByPk(channelId);

  if (!channel) {
    throw new NotFoundError('Channel not found');
  }

  // Only creator or admin can delete
  if (channel.createdBy !== userId && userRole !== 'admin') {
    throw new ForbiddenError('Only channel creator or admin can delete channel');
  }

  await channel.destroy();
};

/**
 * Join a public channel
 */
const joinChannel = async (channelId: string, userId: string): Promise<void> => {
  const channel = await Channel.findByPk(channelId);

  if (!channel) {
    throw new NotFoundError('Channel not found');
  }

  if (channel.type !== 'public') {
    throw new ForbiddenError('Cannot directly join private channel. Use request endpoint instead.');
  }

  // Check if already member
  const existingMember = await ChannelMember.findOne({
    where: { channelId, userId }
  });

  if (existingMember) {
    throw new ConflictError('Already a member of this channel');
  }

  // Add as member
  await ChannelMember.create({
    channelId,
    userId
  });
};

/**
 * Leave a channel
 */
const leaveChannel = async (channelId: string, userId: string): Promise<void> => {
  const channel = await Channel.findByPk(channelId);

  if (!channel) {
    throw new NotFoundError('Channel not found');
  }

  // Check membership
  const member = await ChannelMember.findOne({
    where: { channelId, userId }
  });

  if (!member) {
    throw new ValidationError('Not a member of this channel');
  }

  // Remove member
  await member.destroy();
};

/**
 * Request to join private channel
 */
const requestJoinChannel = async (channelId: string, userId: string): Promise<void> => {
  const channel = await Channel.findByPk(channelId);

  if (!channel) {
    throw new NotFoundError('Channel not found');
  }

  if (channel.type !== 'private') {
    throw new ForbiddenError('Use join endpoint for public channels');
  }

  // Check if already member
  const existingMember = await ChannelMember.findOne({
    where: { channelId, userId }
  });

  if (existingMember) {
    throw new ConflictError('Already a member of this channel');
  }

  // Check for existing pending request
  const existingRequest = await ChannelInvite.findOne({
    where: {
      channelId,
      invitedUserId: userId,
      status: 'pending'
    }
  });

  if (existingRequest) {
    throw new ConflictError('Join request already pending for this channel');
  }

  // Create invite request (user requesting to join)
  await ChannelInvite.create({
    channelId,
    invitedUserId: userId,
    invitedBy: userId, // User requesting themselves
    status: 'pending'
  });
};

/**
 * Approve join request
 */
const approveJoinRequest = async (
  channelId: string,
  targetUserId: string,
  approverUserId: string,
  approverRole: string
): Promise<void> => {
  const channel = await Channel.findByPk(channelId);

  if (!channel) {
    throw new NotFoundError('Channel not found');
  }

  // Only creator or admin can approve
  if (channel.createdBy !== approverUserId && approverRole !== 'admin') {
    throw new ForbiddenError('Only channel creator or admin can approve requests');
  }

  // Find pending invite
  const invite = await ChannelInvite.findOne({
    where: {
      channelId,
      invitedUserId: targetUserId,
      status: 'pending'
    }
  });

  if (!invite) {
    throw new NotFoundError('Pending join request not found');
  }

  // Add as member
  await ChannelMember.create({
    channelId,
    userId: targetUserId
  });

  // Update invite status
  invite.status = 'accepted';
  await invite.save();
};

/**
 * Invite user to private channel
 */
const inviteToChannel = async (
  channelId: string,
  targetUserId: string,
  inviterUserId: string,
  inviterRole: string
): Promise<void> => {
  const channel = await Channel.findByPk(channelId);

  if (!channel) {
    throw new NotFoundError('Channel not found');
  }

  // Only creator or admin can invite
  if (channel.createdBy !== inviterUserId && inviterRole !== 'admin') {
    throw new ForbiddenError('Only channel creator or admin can invite users');
  }

  // Validate target user exists
  const targetUser = await User.findByPk(targetUserId);
  if (!targetUser) {
    throw new ValidationError('Target user not found');
  }

  // Check if already member
  const existingMember = await ChannelMember.findOne({
    where: { channelId, userId: targetUserId }
  });

  if (existingMember) {
    throw new ConflictError('User is already a member of this channel');
  }

  // Check for existing invite
  const existingInvite = await ChannelInvite.findOne({
    where: {
      channelId,
      invitedUserId: targetUserId,
      status: 'pending'
    }
  });

  if (existingInvite) {
    throw new ConflictError('User already has a pending invite to this channel');
  }

  // Create invite
  await ChannelInvite.create({
    channelId,
    invitedUserId: targetUserId,
    invitedBy: inviterUserId,
    status: 'pending'
  });
};

/**
 * Format channel response (excludes sensitive fields)
 */
const formatChannelResponse = (channel: Channel): any => {
  return {
    id: channel.id,
    name: channel.name,
    description: channel.description,
    type: channel.type,
    createdBy: channel.createdBy,
    createdAt: channel.createdAt,
    updatedAt: channel.updatedAt
  };
};

/**
 * Get all accessible channels for a user
 */
const getAccessibleChannels = async (userId: string): Promise<any[]> => {
  // Get public channels
  const publicChannels = await Channel.findAll({
    where: { type: 'public', deletedAt: null }
  });

  // Get channels where user is a member
  const memberChannels = await ChannelMember.findAll({
    where: { userId },
    attributes: ['channelId']
  });

  const memberChannelIds = memberChannels.map(m => m.channelId);

  let result: any[] = publicChannels;

  // Get additional channels user is a member of (if any)
  if (memberChannelIds.length > 0) {
    const additionalChannels = await Channel.findAll({
      where: {
        id: memberChannelIds,
        deletedAt: null
      }
    });

    // Merge and deduplicate by ID
    const channelMap = new Map();
    publicChannels.forEach(ch => channelMap.set(ch.id, ch));
    additionalChannels.forEach(ch => channelMap.set(ch.id, ch));

    result = Array.from(channelMap.values());
  }

  return result;
};

/**
 * Get channel members
 */
const getChannelMembers = async (channelId: string): Promise<any[]> => {
  const members = await ChannelMember.findAll({
    where: { channelId },
    include: [
      {
        model: User,
        attributes: ['id', 'fullName', 'email', 'profilePhotoUrl']
      }
    ]
  });

  return members.map((member: any) => ({
    userId: member.userId,
    channelId: member.channelId,
    joinedAt: member.joinedAt,
    user: member.User
  }));
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
  getChannelMembers
};
