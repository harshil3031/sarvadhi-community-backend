import { Channel, ChannelMember, ChannelInvite, User } from '../db/models/index.js';
import { ValidationError, NotFoundError, ForbiddenError, ConflictError } from '../utils/errors.js';
import notificationService, { NotificationType } from './notification.service.js';
import { emitToUser } from '../socket.js';
import { fn, col, Op } from 'sequelize';

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

  // For private channels, only members can view posts, but metadata is okay for joining
  // if (channel.type === 'private' && !isMember) {
  //   throw new ForbiddenError('Access denied to this private channel');
  // }

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

  // Emit real-time membership update
  emitToUser(userId, 'channel_membership_changed', { channelId, isMember: true });
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

  // Emit real-time membership update
  emitToUser(userId, 'channel_membership_changed', { channelId, isMember: false });
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

  // Emit real-time membership update to target user
  emitToUser(targetUserId, 'channel_membership_changed', { channelId, isMember: true });
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
      invitedUserId: targetUserId
    }
  });

  if (existingInvite) {
    if (existingInvite.status === 'pending') {
      throw new ConflictError('User already has a pending invite to this channel');
    } else if (existingInvite.status === 'rejected') {
      // Delete the old rejected invite so we can create a new one
      await existingInvite.destroy();
    } else if (existingInvite.status === 'accepted') {
      // This shouldn't happen since we check membership above, but just in case
      throw new ConflictError('User has already accepted the invite');
    }
  }

  // Create invite
  await ChannelInvite.create({
    channelId,
    invitedUserId: targetUserId,
    invitedBy: inviterUserId,
    status: 'pending'
  });

  // 🔔 Notify user
  try {
    await notificationService.createNotification(
      targetUserId,
      NotificationType.CHANNEL_INVITE,
      channelId
    );
  } catch (err) {
    console.error('Failed to create notification for channel invite:', err);
  }
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
  // Get channels where user is a member
  const memberRecords = await ChannelMember.findAll({
    where: { userId },
    attributes: ['channelId']
  });
  const memberIdList = memberRecords.map(m => m.channelId);

  // Find all public channels OR channels where the user is a member
  const channels = await Channel.findAll({
    where: {
      [Op.or]: [
        { type: 'public' },
        { id: memberIdList }
      ],
      deletedAt: null
    },
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'fullName', 'email']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  // Format with membership and count
  return Promise.all(
    channels.map(async (channel) => {
      const isMember = memberIdList.includes(channel.id);

      const memberCount = await ChannelMember.count({
        where: { channelId: channel.id }
      });

      const formatted = formatChannelResponse(channel);
      return {
        ...formatted,
        isMember,
        memberCount
      };
    })
  );
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

/**
 * Search channels by name
 */
const searchChannels = async (query: string, userId?: string): Promise<any[]> => {
  const where: any = {
    name: { [Op.iLike]: `%${query}%` },
    deletedAt: null
  };

  const channels = await Channel.findAll({
    where,
    include: [
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
          fn('COUNT', col('channel_members.user_id')),
          'memberCount'
        ]
      ]
    },
    group: ['Channel.id'],
    limit: 10
  });

  return Promise.all(
    channels.map(async (channel) => {
      let isMember = false;
      if (userId) {
        const membership = await ChannelMember.findOne({
          where: { channelId: channel.id, userId }
        });
        isMember = !!membership;
      }
      return {
        ...formatChannelResponse(channel),
        memberCount: (channel as any).getDataValue('memberCount') || 0,
        isMember
      };
    })
  );
};

/**
 * Remove a member from a channel
 */
const removeMember = async (
  channelId: string,
  userId: string,
  requestingUserId: string,
  requestingUserRole: string
): Promise<void> => {
  const channel = await Channel.findByPk(channelId);

  if (!channel) {
    throw new NotFoundError('Channel not found');
  }

  // Only creator or admin can remove members
  if (channel.createdBy !== requestingUserId && requestingUserRole !== 'admin' && requestingUserRole !== 'moderator') {
    throw new ForbiddenError('Only channel creator or admin can remove members');
  }

  // Cannot remove the creator
  if (userId === channel.createdBy) {
    throw new ForbiddenError('Cannot remove channel creator');
  }

  // Check if user is a member
  const member = await ChannelMember.findOne({
    where: { channelId, userId }
  });

  if (!member) {
    throw new NotFoundError('User is not a member of this channel');
  }

  // Remove the member
  await member.destroy();
};

/**
 * Accept a channel invitation
 */
const acceptInvite = async (channelId: string, userId: string): Promise<void> => {
  const channel = await Channel.findByPk(channelId);

  if (!channel) {
    throw new NotFoundError('Channel not found');
  }

  // Find pending invite
  const invite = await ChannelInvite.findOne({
    where: {
      channelId,
      invitedUserId: userId,
      status: 'pending'
    }
  });

  if (!invite) {
    throw new NotFoundError('Pending invitation not found');
  }

  // Check if already a member (shouldn't happen but safeguard)
  const existingMember = await ChannelMember.findOne({
    where: { channelId, userId }
  });

  if (existingMember) {
    // Update invite status and return success
    invite.status = 'accepted';
    await invite.save();
    return;
  }

  // Create channel membership
  await ChannelMember.create({
    channelId,
    userId
  });

  // Update invite status to accepted
  invite.status = 'accepted';
  await invite.save();

  // Emit real-time membership update
  emitToUser(userId, 'channel_membership_changed', { channelId, isMember: true });
};

/**
 * Reject a channel invitation
 */
const rejectInvite = async (channelId: string, userId: string): Promise<void> => {
  const channel = await Channel.findByPk(channelId);

  if (!channel) {
    throw new NotFoundError('Channel not found');
  }

  // Find pending invite
  const invite = await ChannelInvite.findOne({
    where: {
      channelId,
      invitedUserId: userId,
      status: 'pending'
    }
  });

  if (!invite) {
    throw new NotFoundError('Pending invitation not found');
  }

  // Update status to rejected
  invite.status = 'rejected';
  await invite.save();
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
