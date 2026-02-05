import { Request, Response, NextFunction } from 'express';
import config from '../config/index.js';
import { AppError } from '../utils/errors.js';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err } as AppError;
  error.message = err.message;
  error.statusCode = (err as AppError).statusCode || 500;

  // Log error for debugging
  if (config.env === 'development') {
    console.error('Error:', err);
  }

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const message = (err as any).errors.map((e: any) => e.message).join(', ');
    error = new AppError(message, 400);
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 409);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    error: error.message,
    ...(config.env === 'development' && { stack: err.stack })
  });
};

/**
 * Handle 404 errors
 */
export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Async handler to wrap async route handlers
 */
export const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};
