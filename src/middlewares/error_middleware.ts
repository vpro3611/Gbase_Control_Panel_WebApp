import { Request, Response, NextFunction } from 'express';
import { AppError } from '../domain/errors/app_error';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  console.error('[Unhandled Error]:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error occurred',
  });
}
