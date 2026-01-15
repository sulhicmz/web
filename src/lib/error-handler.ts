import type { AppError, ApiResponse } from '../types';
import { getMessageProvider } from './error-handler/provider-instance';

const getMessages = () => getMessageProvider();

export class ValidationError extends Error {
  public statusCode: number = 400;
  public errorCode: string = 'VALIDATION_ERROR';

  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  public statusCode: number = 401;
  public errorCode: string = 'AUTHENTICATION_ERROR';

  constructor(message: string = getMessages().AUTH_UNAUTHORIZED) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  public statusCode: number = 403;
  public errorCode: string = 'AUTHORIZATION_ERROR';

  constructor(message: string = getMessages().AUTH_UNAUTHORIZED) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  public statusCode: number = 404;
  public errorCode: string = 'NOT_FOUND';

  constructor(message: string = getMessages().NOT_FOUND) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  public statusCode: number = 409;
  public errorCode: string = 'CONFLICT';

  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends Error {
  public statusCode: number = 429;
  public errorCode: string = 'RATE_LIMIT_EXCEEDED';

  constructor(message: string = getMessages().RATE_LIMIT_EXCEEDED) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends Error {
  public statusCode: number = 502;
  public errorCode: string = 'EXTERNAL_SERVICE_ERROR';

  constructor(message: string, public service?: string) {
    super(message);
    this.name = 'ExternalServiceError';
  }
}

interface ErrorTypeMetadata {
  statusCode: number;
  errorCode: string;
  isRetryable: boolean;
}

function getErrorType(error: unknown): ErrorTypeMetadata | null {
  if (error instanceof ValidationError) {
    return {
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      isRetryable: false,
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      isRetryable: false,
    };
  }

  if (error instanceof AuthorizationError) {
    return {
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      isRetryable: false,
    };
  }

  if (error instanceof NotFoundError) {
    return {
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      isRetryable: false,
    };
  }

  if (error instanceof ConflictError) {
    return {
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      isRetryable: false,
    };
  }

  if (error instanceof RateLimitError) {
    return {
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      isRetryable: true,
    };
  }

  if (error instanceof ExternalServiceError) {
    return {
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      isRetryable: true,
    };
  }

  return null;
}

export const ErrorHandler = {
  handleApiError(error: unknown): ApiResponse<never> {
    console.error('API Error:', error);

    const errorType = getErrorType(error);

    if (errorType && error instanceof Error) {
      return {
        success: false,
        error: errorType.errorCode,
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: getMessages().INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    };
  },

  handleMiddlewareError(error: unknown): Response {
    console.error('Middleware Error:', error);

    const errorType = getErrorType(error);

    if (errorType && error instanceof Error) {
      return new Response(JSON.stringify({
        error: errorType.errorCode,
        message: error.message,
      }), {
        status: errorType.statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      error: 'INTERNAL_ERROR',
      message: getMessages().INTERNAL_ERROR,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  handleComponentError(error: unknown): AppError {
    console.error('Component Error:', error);

    if (error instanceof Error) {
      return {
        code: 'COMPONENT_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: getMessages().INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    };
  },

  logError(error: unknown, context?: Record<string, unknown>) {
    const errorInfo = {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    };

    console.error('Application Error:', errorInfo);
  },

  getUserFriendlyMessage(error: unknown): string {
    if (error instanceof ValidationError) {
      return error.message;
    }

    if (error instanceof AuthenticationError) {
      return getMessages().AUTH_INVALID_CREDENTIALS;
    }

    if (error instanceof AuthorizationError) {
      return getMessages().AUTH_UNAUTHORIZED;
    }

    if (error instanceof NotFoundError) {
      return getMessages().NOT_FOUND;
    }

    if (error instanceof RateLimitError) {
      return getMessages().RATE_LIMIT_EXCEEDED;
    }

    if (error instanceof ExternalServiceError) {
      return `Layanan ${error.service || 'eksternal'} sedang bermasalah. Silakan coba lagi nanti.`;
    }

    return 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi dukungan teknis.';
  },

  isRetryableError(error: unknown): boolean {
    const errorType = getErrorType(error);

    if (errorType) {
      return errorType.isRetryable;
    }

    if (error instanceof Error && error.message.includes('network')) {
      return true;
    }

    return false;
  },

  getStatusCode(error: unknown): number {
    const errorType = getErrorType(error);

    if (errorType) {
      return errorType.statusCode;
    }

    return 500;
  },
};

export function createErrorBoundary(_message: string = 'Terjadi kesalahan') {
  return (error: unknown) => {
    ErrorHandler.logError(error, { context: 'error_boundary' });

    return {
      error: ErrorHandler.handleComponentError(error),
      userMessage: ErrorHandler.getUserFriendlyMessage(error),
    };
  };
}

export const ValidationHelpers = {
  required<T>(value: T, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new ValidationError(`${fieldName} wajib diisi`, fieldName);
    }
  },

  email(value: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new ValidationError(getMessages().VALIDATION_INVALID_EMAIL, 'email');
    }
  },

  phone(value: string): void {
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
    if (!phoneRegex.test(value)) {
      throw new ValidationError(getMessages().VALIDATION_INVALID_PHONE, 'phone');
    }
  },

  password(value: string): void {
    if (value.length < 8) {
      throw new ValidationError(getMessages().VALIDATION_PASSWORD_TOO_WEAK, 'password');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      throw new ValidationError(getMessages().VALIDATION_PASSWORD_TOO_WEAK, 'password');
    }
  },

  passwordConfirmation(password: string, confirmation: string): void {
    if (password !== confirmation) {
      throw new ValidationError(getMessages().VALIDATION_PASSWORDS_NOT_MATCH, 'confirmPassword');
    }
  },

  minLength(value: string, minLength: number, fieldName: string): void {
    if (value.length < minLength) {
      throw new ValidationError(`${fieldName} minimal ${minLength} karakter`, fieldName);
    }
  },

  maxLength(value: string, maxLength: number, fieldName: string): void {
    if (value.length > maxLength) {
      throw new ValidationError(`${fieldName} maksimal ${maxLength} karakter`, fieldName);
    }
  },
};

export const ErrorUtils = {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  ErrorHandler,
  ValidationHelpers,
  createErrorBoundary,
};
