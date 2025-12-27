// Custom error classes for better error handling

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT')
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR')
  }
}

// Prisma error handler
export function handlePrismaError(error: unknown): AppError {
  // Check if it's a Prisma error
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const prismaError = error as { code: string; meta?: unknown }

    switch (prismaError.code) {
      case 'P2002':
        // Unique constraint violation
        return new ConflictError('A record with this value already exists')
      case 'P2025':
        // Record not found
        return new NotFoundError('The requested resource was not found')
      case 'P2003':
        // Foreign key constraint violation
        return new ValidationError('Invalid reference to related record')
      case 'P2014':
        // Invalid ID
        return new ValidationError('Invalid ID format')
      case 'P2023':
        // Inconsistent column data
        return new ValidationError('Invalid data format')
      default:
        return new DatabaseError(`Database error: ${prismaError.code}`)
    }
  }

  // If it's already an AppError, return it
  if (error instanceof AppError) {
    return error
  }

  // Unknown error
  if (error instanceof Error) {
    return new AppError(error.message)
  }

  return new AppError('An unexpected error occurred')
}

// Format error response
export function formatErrorResponse(error: AppError) {
  return {
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      ...(error instanceof ValidationError && error.details ? { details: error.details } : {}),
    },
  }
}
