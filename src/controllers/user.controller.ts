/**
 * User Controllers
 * Handle user-related business logic
 */

import { Request, Response } from 'express';
import userService from '../services/user.service.js';
import { ValidationError } from '../utils/errors.js';

/**
 * PUT /auth/profile
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const { fullName, avatar } = req.body;

  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const user = await userService.updateUser(req.user.id, {
    fullName,
    profilePhotoUrl: avatar
  });

  res.status(200).json({
    success: true,
    data: user
  });
};

export const userController = {
  getMe: null,
  updateMe: updateProfile,
  getUserById: null,
  searchUsers: null
};

export default userController;
