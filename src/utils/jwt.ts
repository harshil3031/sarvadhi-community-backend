import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config/index.js';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

/**
 * Generate JWT token
 * @param payload - Data to encode in token
 * @returns JWT token
 */
export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  } as SignOptions);
};

/**
 * Verify JWT token
 * @param token - JWT token
 * @returns Decoded payload
 */
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
};
