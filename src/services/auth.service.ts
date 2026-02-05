import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

import { User } from '../db/models/User.js';
import { generateToken } from '../utils/jwt.js';
import {
  ValidationError,
  ConflictError,
  UnauthorizedError,
} from '../utils/errors.js';

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

const SARVADHI_EMAIL_DOMAIN = '@sarvadhi.com';

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID is not defined');
}

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

const validateEmailDomain = (email: string): boolean => {
  return email.toLowerCase().endsWith(SARVADHI_EMAIL_DOMAIN);
};

const formatUserResponse = (user: User) => {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    profilePhotoUrl: user.profilePhotoUrl,
    department: user.department,
    authProvider: user.authProvider,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/* -------------------------------------------------------------------------- */
/*                              LOCAL AUTH (EMAIL)                             */
/* -------------------------------------------------------------------------- */

const registerUser = async (
  fullName: string,
  email: string,
  password: string
): Promise<{ token: string; user: any }> => {
  const normalizedEmail = email.toLowerCase();

  if (!validateEmailDomain(normalizedEmail)) {
    throw new ValidationError(
      `Email must be from ${SARVADHI_EMAIL_DOMAIN}`
    );
  }

  const existingUser = await User.findOne({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email: normalizedEmail,
    passwordHash,
    authProvider: 'local',
    role: 'employee',
    isActive: true,
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: formatUserResponse(user),
  };
};

const loginUser = async (
  email: string,
  password: string
): Promise<{ token: string; user: any }> => {
  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({
    where: { email: normalizedEmail },
  });

  if (!user || !user.passwordHash) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('User account is inactive');
  }

  if (user.authProvider !== 'local') {
    throw new UnauthorizedError(
      'This account uses a different authentication method'
    );
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: formatUserResponse(user),
  };
};

/* -------------------------------------------------------------------------- */
/*                              GOOGLE OAUTH LOGIN                             */
/* -------------------------------------------------------------------------- */

const googleAuthUser = async (
  idToken: string
): Promise<{ token: string; user: any }> => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload?.email) {
    throw new UnauthorizedError('Invalid Google token');
  }

  const email = payload.email.toLowerCase();

  if (!validateEmailDomain(email)) {
    throw new ValidationError(
      `Email must be from ${SARVADHI_EMAIL_DOMAIN}`
    );
  }

  let user = await User.findOne({ where: { email } });

  if (!user) {
    user = await User.create({
      fullName: payload.name ?? email.split('@')[0],
      email,
      googleId: payload.sub,
      profilePhotoUrl: payload.picture,
      authProvider: 'google',
      role: 'employee',
      isActive: true,
    });
  }

  if (!user.isActive) {
    throw new UnauthorizedError('User account is inactive');
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: formatUserResponse(user),
  };
};

/* -------------------------------------------------------------------------- */
/*                              CURRENT USER                                  */
/* -------------------------------------------------------------------------- */

const getCurrentUser = async (userId: string): Promise<any> => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new ValidationError('User not found');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('User account is inactive');
  }

  return formatUserResponse(user);
};

/* -------------------------------------------------------------------------- */
/*                                   EXPORTS                                  */
/* -------------------------------------------------------------------------- */

export default {
  registerUser,
  loginUser,
  googleAuthUser,
  getCurrentUser,
};
