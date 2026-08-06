export abstract class AppError extends Error {
  public abstract readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, isOperational: boolean = true) {
    super(message);
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly statusCode = 400;
}

export class UnauthorizedError extends AppError {
  public readonly statusCode = 401;
}

export class ForbiddenError extends AppError {
  public readonly statusCode = 403;
}

export class NotFoundError extends AppError {
  public readonly statusCode = 404;
}

export class ConflictError extends AppError {
  public readonly statusCode = 409;
}

export class InternalServerError extends AppError {
  public readonly statusCode = 500;

  constructor(message: string = 'Internal Server Error') {
    super(message, false);
  }
}
