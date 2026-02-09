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

/**
 * GET /users/me
 * Get current user profile
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  const user = await userService.getUserById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
};

/**
 * GET /users/:id
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = await userService.getUserById(id);

  res.status(200).json({
    success: true,
    data: user
  });
};

/**
 * GET /users/search
 * Search users
 */
export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  const { q } = req.query;
  const query = q as string;

  if (!query) {
    res.status(200).json({
      success: true,
      data: []
    });
    return;
  }

  const users = await userService.searchUsers(query, req.user?.id);

  res.status(200).json({
    success: true,
    data: users
  });
};

export const userController = {
  getMe,
  updateMe: updateProfile,
  getUserById,
  searchUsers
};

export default userController;
