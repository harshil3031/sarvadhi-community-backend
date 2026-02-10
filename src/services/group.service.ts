import { Group, GroupMember, User } from '../db/models/index.js';
import { ValidationError, NotFoundError, ForbiddenError, ConflictError } from '../utils/errors.js';
import notificationService, { NotificationType } from './notification.service.js';
import { Op } from 'sequelize';

/**
 * Create a new group
 */
const createGroup = async (
  name: string,
  description: string | null,
  createdBy: string
): Promise<any> => {
  // Validate creator exists
  const creator = await User.findByPk(createdBy);
  if (!creator) {
    throw new ValidationError('Creator user not found');
  }

  // Create group
  const group = await Group.create({
    name,
    description,
    createdBy
  });

  // Add creator as first member
  await GroupMember.create({
    groupId: group.id,
    userId: createdBy
  });

  return formatGroupResponse(group);
};

/**
 * Get all groups current user belongs to
 */
const getMyGroups = async (userId: string): Promise<any[]> => {
  // Find all groups where user is a member
  const membershipGroups = await GroupMember.findAll({
    where: { userId },
    attributes: ['groupId']
  });

  const groupIds = membershipGroups.map(m => m.groupId);

  if (groupIds.length === 0) {
    return [];
  }

  const groups = await Group.findAll({
    where: { id: groupIds, deletedAt: null },
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'fullName', 'email']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  // Get member count for each group
  const result = [];
  for (const group of groups) {
    const memberCount = await GroupMember.count({
      where: { groupId: group.id }
    });
    result.push({
      ...formatGroupResponse(group),
      memberCount
    });
  }

  return result;
};

/**
 * Get group by ID with member information
 */
const getGroupById = async (groupId: string, userId: string): Promise<any> => {
  const group = await Group.findByPk(groupId, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'fullName', 'email']
      }
    ]
  });

  if (!group) {
    throw new NotFoundError('Group not found');
  }

  // Check if user is member
  const isMember = await GroupMember.findOne({
    where: { groupId, userId }
  });

  // if (!isMember) {
  //   throw new ForbiddenError('Access denied to this group');
  // }

  // Get member count
  const memberCount = await GroupMember.count({
    where: { groupId }
  });

  const response = formatGroupResponse(group);
  return {
    ...response,
    isMember: !!isMember,
    memberCount
  };
};

/**
 * Update group (creator only)
 */
const updateGroup = async (
  groupId: string,
  userId: string,
  updates: { name?: string; description?: string }
): Promise<any> => {
  const group = await Group.findByPk(groupId);

  if (!group) {
    throw new NotFoundError('Group not found');
  }

  // Only creator can update
  if (group.createdBy !== userId) {
    throw new ForbiddenError('Only group creator can update group');
  }

  // Update fields
  if (updates.name) {
    group.name = updates.name;
  }
  if (updates.description !== undefined) {
    group.description = updates.description;
  }

  await group.save();

  return formatGroupResponse(group);
};

/**
 * Delete group (soft delete via paranoid) - creator only
 */
const deleteGroup = async (groupId: string, userId: string): Promise<void> => {
  const group = await Group.findByPk(groupId);

  if (!group) {
    throw new NotFoundError('Group not found');
  }

  // Only creator can delete
  if (group.createdBy !== userId) {
    throw new ForbiddenError('Only group creator can delete group');
  }

  await group.destroy();
};

/**
 * Invite user to group (creator only)
 */
const inviteUser = async (
  groupId: string,
  targetUserIdOrEmail: string,
  inviterId: string
): Promise<void> => {
  const group = await Group.findByPk(groupId);

  if (!group) {
    throw new NotFoundError('Group not found');
  }

  // Only creator can invite
  if (group.createdBy !== inviterId) {
    throw new ForbiddenError('Only group creator can invite users');
  }

  // Find user by ID or email
  let targetUser;
  if (targetUserIdOrEmail.includes('@')) {
    // It's an email
    targetUser = await User.findOne({ where: { email: targetUserIdOrEmail } });
  } else {
    // It's a user ID
    targetUser = await User.findByPk(targetUserIdOrEmail);
  }

  if (!targetUser) {
    throw new ValidationError('Target user not found');
  }

  // Check if already member
  const existingMember = await GroupMember.findOne({
    where: { groupId, userId: targetUser.id }
  });

  if (existingMember) {
    throw new ConflictError('User is already a member of this group');
  }

  // Add as member
  await GroupMember.create({
    groupId,
    userId: targetUser.id
  });

  const inviter = await User.findByPk(inviterId, {
    attributes: ['id', 'fullName', 'profilePhotoUrl']
  });

  // 🔔 Notify user
  try {
    await notificationService.createNotification(
      targetUser.id,
      NotificationType.GROUP_INVITE,
      groupId,
      inviter
    );
  } catch (err) {
    console.error('Failed to create notification for group invite:', err);
  }
};

/**
 * Leave a group
 */
const leaveGroup = async (groupId: string, userId: string): Promise<void> => {
  const group = await Group.findByPk(groupId);

  if (!group) {
    throw new NotFoundError('Group not found');
  }

  // Check membership
  const member = await GroupMember.findOne({
    where: { groupId, userId }
  });

  if (!member) {
    throw new ValidationError('Not a member of this group');
  }

  // Remove member
  await member.destroy();
};

/**
 * Remove user from group (creator only)
 */
const removeUser = async (
  groupId: string,
  targetUserId: string,
  removerId: string
): Promise<void> => {
  const group = await Group.findByPk(groupId);

  if (!group) {
    throw new NotFoundError('Group not found');
  }

  // Only creator can remove
  if (group.createdBy !== removerId) {
    throw new ForbiddenError('Only group creator can remove users');
  }

  // Check membership of target user
  const member = await GroupMember.findOne({
    where: { groupId, userId: targetUserId }
  });

  if (!member) {
    throw new ValidationError('User is not a member of this group');
  }

  // Remove member
  await member.destroy();
};

/**
 * Get all accessible groups (all active groups) with membership status
 */
const getAllAccessibleGroups = async (userId: string): Promise<any[]> => {
  // Get all groups
  const groups = await Group.findAll({
    where: { deletedAt: null },
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'fullName', 'email']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  // Get user's memberships
  const userMemberships = await GroupMember.findAll({
    where: { userId },
    attributes: ['groupId']
  });
  const joinedGroupIds = new Set(userMemberships.map(m => m.groupId));

  // Format response
  const result = [];
  for (const group of groups) {
    const memberCount = await GroupMember.count({
      where: { groupId: group.id }
    });

    result.push({
      ...formatGroupResponse(group),
      memberCount,
      isMember: joinedGroupIds.has(group.id)
    });
  }

  return result;
};

/**
 * Get all members of a group with user information
 */
const getGroupMembers = async (groupId: string, userId: string): Promise<any[]> => {
  const group = await Group.findByPk(groupId);

  if (!group) {
    throw new NotFoundError('Group not found');
  }

  // Check if requesting user is a member
  const isMember = await GroupMember.findOne({
    where: { groupId, userId }
  });

  if (!isMember) {
    throw new ForbiddenError('Access denied to this group');
  }

  // Get all members with user info
  const members = await GroupMember.findAll({
    where: { groupId },
    include: [
      {
        model: User,
        attributes: ['id', 'fullName', 'email', 'profilePhotoUrl']
      }
    ],
    order: [['joinedAt', 'ASC']]
  });

  return members.map((member: any) => ({
    userId: member.userId,
    groupId: member.groupId,
    joinedAt: member.joinedAt,
    user: member.User
  }));
};

/**
 * Join a group (add user to group members)
 */
const joinGroup = async (groupId: string, userId: string): Promise<void> => {
  const group = await Group.findByPk(groupId);

  if (!group) {
    throw new NotFoundError('Group not found');
  }

  // Verify user exists
  const user = await User.findByPk(userId);
  if (!user) {
    throw new ValidationError('User not found');
  }

  // Check if already a member
  const existingMember = await GroupMember.findOne({
    where: { groupId, userId }
  });

  if (existingMember) {
    throw new ConflictError('Already a member of this group');
  }

  // Add as member
  await GroupMember.create({
    groupId,
    userId
  });
};

/**
 * Format group response (excludes sensitive fields)
 */
const formatGroupResponse = (group: Group): any => {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    creatorId: group.createdBy,
    createdAt: group.createdAt
  };
};

/**
 * Search groups by name
 */
const searchGroups = async (query: string, userId?: string): Promise<any[]> => {
  const where: any = {
    name: { [Op.iLike]: `%${query}%` },
    deletedAt: null
  };

  const groups = await Group.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: 10
  });

  return Promise.all(
    groups.map(async (group) => {
      let isMember = false;
      if (userId) {
        const membership = await GroupMember.findOne({
          where: { groupId: group.id, userId }
        });
        isMember = !!membership;
      }

      const memberCount = await GroupMember.count({
        where: { groupId: group.id }
      });

      return {
        ...formatGroupResponse(group),
        memberCount,
        isMember
      };
    })
  );
};

export default {
  createGroup,
  getMyGroups,
  getAllAccessibleGroups,
  getGroupById,
  getGroupMembers,
  updateGroup,
  deleteGroup,
  inviteUser,
  joinGroup,
  leaveGroup,
  removeUser,
  searchGroups
};
