import { User } from '../db/models/index.js';
import { NotFoundError } from '../utils/errors.js';
import { Op } from 'sequelize';

/**
 * Get user by ID
 */
const getUserById = async (userId: string): Promise<any> => {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'fullName', 'email', 'profilePhotoUrl', 'role', 'department', 'createdAt']
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

/**
 * Search users by name or email
 */
const searchUsers = async (query: string, excludeUserId?: string): Promise<any[]> => {
  const where: any = {
    [Op.or]: [
      { fullName: { [Op.iLike]: `%${query}%` } },
      { email: { [Op.iLike]: `%${query}%` } }
    ]
  };

  if (excludeUserId) {
    where.id = { [Op.ne]: excludeUserId };
  }

  const users = await User.findAll({
    where,
    attributes: ['id', 'fullName', 'email', 'profilePhotoUrl', 'role', 'department', 'last_seen_at'],
    limit: 20
  });

  return users;
};

/**
 * Update user profile
 */
const updateUser = async (
  userId: string,
  updates: {
    fullName?: string;
    profilePhotoUrl?: string;
  }
): Promise<any> => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Update fields if provided
  if (updates.fullName !== undefined) {
    user.fullName = updates.fullName;
  }
  if (updates.profilePhotoUrl !== undefined) {
    user.profilePhotoUrl = updates.profilePhotoUrl;
  }

  await user.save();

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    profilePhotoUrl: user.profilePhotoUrl,
    role: user.role,
    createdAt: user.createdAt
  };
};

export const userService = {
  getUserById,
  updateUser,
  searchUsers,
  getUserByEmail: null
};

export default userService;
