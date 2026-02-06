import { Request, Response } from 'express';
import authService from '../services/auth.service.js';
import { ValidationError } from '../utils/errors.js';

/**
 * POST /auth/register
 * Register a new user with email and password
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { fullName, email, password } = req.body;

  // Input validation
  if (!fullName || !email || !password) {
    throw new ValidationError('fullName, email, and password are required');
  }

  if (typeof fullName !== 'string' || fullName.trim().length === 0) {
    throw new ValidationError('fullName must be a non-empty string');
  }

  if (typeof email !== 'string' || email.trim().length === 0) {
    throw new ValidationError('email must be a non-empty string');
  }

  if (typeof password !== 'string' || password.length < 8) {
    throw new ValidationError('password must be at least 8 characters');
  }

  // Call service to register user
  const result = await authService.registerUser(fullName, email, password);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      token: result.token,
      user: result.user
    }
  });
};

/**
 * POST /auth/login
 * Login with email and password
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    throw new ValidationError('email and password are required');
  }

  if (typeof email !== 'string' || email.trim().length === 0) {
    throw new ValidationError('email must be a non-empty string');
  }

  if (typeof password !== 'string' || password.length === 0) {
    throw new ValidationError('password is required');
  }

  // Call service to authenticate user
  const result = await authService.loginUser(email, password);
  console.log("Login successful for user:", result.user.data);
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token: result.token,
      user: result.user
    }
  });
};

/**
 * POST /auth/google
 * Google OAuth login/signup
 */
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  // Input validation
  if (!idToken) {
    throw new ValidationError('idToken is required');
  }

  if (typeof idToken !== 'string' || idToken.trim().length === 0) {
    throw new ValidationError('idToken must be a non-empty string');
  }

  // Call service to handle Google OAuth
  const result = await authService.googleAuthUser(idToken);

  res.status(200).json({
    success: true,
    message: 'Google authentication successful',
    data: {
      token: result.token,
      user: result.user
    }
  });
};

/**
 * GET /auth/me
 * Get current authenticated user
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ValidationError('User not authenticated');
  }

  // Call service to get current user details
  const user = await authService.getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
};

/**
 * POST /auth/logout
 * Logout current user (client-side token invalidation)
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  // Since we're using JWT, logout is handled client-side by removing the token
  // This endpoint exists for consistency and can be extended for token blacklisting if needed
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

export default {
  register,
  login,
  googleAuth,
  getCurrentUser,
  logout
};
