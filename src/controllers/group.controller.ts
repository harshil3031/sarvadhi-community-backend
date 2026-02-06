import { Request, Response } from 'express';
import groupService from '../services/group.service.js';
import { ValidationError } from '../utils/errors.js';

/**
 * POST /groups
 * Create a new group (any authenticated user)
 */
export const createGroup = async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body;

  if (!name) {
    throw new ValidationError('name is required');
  }

  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new ValidationError('name must be a non-empty string');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const group = await groupService.createGroup(name, description || null, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Group created successfully',
    data: group
  });
};

/**
 * GET /groups/my
 * Get all groups current user belongs to
 */
export const getMyGroups = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const groups = await groupService.getMyGroups(req.user.id);

  res.status(200).json({
    success: true,
    data: groups
  });
};

/**
 * GET /groups/:id
 * Get group by ID with member info
 */
export const getGroupById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('Group ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const group = await groupService.getGroupById(id, req.user.id);

  res.status(200).json({
    success: true,
    data: group
  });
};

/**
 * PUT /groups/:id
 * Update group (creator only)
 */
export const updateGroup = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!id) {
    throw new ValidationError('Group ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const group = await groupService.updateGroup(id, req.user.id, {
    name,
    description
  });

  res.status(200).json({
    success: true,
    message: 'Group updated successfully',
    data: group
  });
};

/**
 * DELETE /groups/:id
 * Delete group (creator only)
 */
export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('Group ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await groupService.deleteGroup(id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Group deleted successfully'
  });
};

/**
 * POST /groups/:id/invite
 * Invite user to group (creator only)
 */
export const inviteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!id) {
    throw new ValidationError('Group ID is required');
  }

  if (!userId) {
    throw new ValidationError('userId is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await groupService.inviteUser(id, userId, req.user.id);

  res.status(200).json({
    success: true,
    message: 'User invited to group successfully'
  });
};

/**
 * POST /groups/:id/leave
 * Leave a group
 */
export const leaveGroup = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('Group ID is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await groupService.leaveGroup(id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Left group successfully'
  });
};

/**
 * POST /groups/:id/remove-user
 * Remove user from group (creator only)
 */
export const removeUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!id) {
    throw new ValidationError('Group ID is required');
  }

  if (!userId) {
    throw new ValidationError('userId is required');
  }

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await groupService.removeUser(id, userId, req.user.id);

  res.status(200).json({
    success: true,
    message: 'User removed from group successfully'
  });
};

/**
 * GET /groups
 * Get all accessible groups
 */
export const getAllGroups = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const groups = await groupService.getAllAccessibleGroups(req.user.id);

  res.status(200).json({
    success: true,
    data: groups
  });
};

/**
 * GET /groups/:id/members
 * Get all members of a group
 */
export const getGroupMembers = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const members = await groupService.getGroupMembers(id, req.user.id);
  console.log(members)
  res.status(200).json({
    success: true,
    data: members
  });
};

/**
 * POST /groups/:id/join
 * Join a group
 */
export const joinGroup = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  await groupService.joinGroup(id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Joined group successfully'
  });
};

export default {
  createGroup,
  getMyGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  inviteUser,
  leaveGroup,
  removeUser,
  getAllGroups,
  getGroupMembers,
  joinGroup
};
