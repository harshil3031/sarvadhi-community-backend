/**
 * User Services
 * Business logic for user operations
 */

import { User } from '../db/models/index.js';
import { NotFoundError } from '../utils/errors.js';

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
  getUserById: null,
  updateUser,
  searchUsers: null,
  getUserByEmail: null
};

export default userService;
