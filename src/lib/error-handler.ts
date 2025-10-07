// ==========================================================================
// AstroPro Digital - Error Handling System
// Sistem penanganan error yang komprehensif untuk aplikasi
// ==========================================================================

import { ERROR_MESSAGES } from '../config';
import type { AppError, ApiResponse } from '../types';

// Error types
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

  constructor(message: string = ERROR_MESSAGES.AUTH_UNAUTHORIZED) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  public statusCode: number = 403;
  public errorCode: string = 'AUTHORIZATION_ERROR';

  constructor(message: string = ERROR_MESSAGES.AUTH_UNAUTHORIZED) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  public statusCode: number = 404;
  public errorCode: string = 'NOT_FOUND';

  constructor(message: string = ERROR_MESSAGES.NOT_FOUND) {
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

  constructor(message: string = ERROR_MESSAGES.RATE_LIMIT_EXCEEDED) {
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

// Error handler utility functions
export const ErrorHandler = {
  /**
   * Handle errors in API routes
   */
  handleApiError(error: unknown): ApiResponse<never> {
    console.error('API Error:', error);

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.errorCode,
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    if (error instanceof AuthenticationError) {
      return {
        success: false,
        error: error.errorCode,
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    if (error instanceof AuthorizationError) {
      return {
        success: false,
        error: error.errorCode,
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: error.errorCode,
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    if (error instanceof ConflictError) {
      return {
        success: false,
        error: error.errorCode,
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    if (error instanceof RateLimitError) {
      return {
        success: false,
        error: error.errorCode,
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    if (error instanceof ExternalServiceError) {
      return {
        success: false,
        error: error.errorCode,
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    // Handle standard errors
    if (error instanceof Error) {
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    // Handle unknown errors
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: ERROR_MESSAGES.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Handle errors in middleware
   */
  handleMiddlewareError(error: unknown): Response {
    console.error('Middleware Error:', error);

    if (error instanceof AuthenticationError) {
      return new Response(JSON.stringify({
        error: error.errorCode,
        message: error.message,
      }), {
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (error instanceof AuthorizationError) {
      return new Response(JSON.stringify({
        error: error.errorCode,
        message: error.message,
      }), {
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (error instanceof RateLimitError) {
      return new Response(JSON.stringify({
        error: error.errorCode,
        message: error.message,
      }), {
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Default error response
    return new Response(JSON.stringify({
      error: 'INTERNAL_ERROR',
      message: ERROR_MESSAGES.INTERNAL_ERROR,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  /**
   * Handle errors in Astro components
   */
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
      message: ERROR_MESSAGES.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Log error with context
   */
  logError(error: unknown, context?: Record<string, any>) {
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

    // In production, you might want to send this to an error tracking service
    // like Sentry, LogRocket, or Bugsnag
  },

  /**
   * Create user-friendly error message
   */
  getUserFriendlyMessage(error: unknown): string {
    if (error instanceof ValidationError) {
      return error.message;
    }

    if (error instanceof AuthenticationError) {
      return ERROR_MESSAGES.AUTH_INVALID_CREDENTIALS;
    }

    if (error instanceof AuthorizationError) {
      return ERROR_MESSAGES.AUTH_UNAUTHORIZED;
    }

    if (error instanceof NotFoundError) {
      return ERROR_MESSAGES.NOT_FOUND;
    }

    if (error instanceof RateLimitError) {
      return ERROR_MESSAGES.RATE_LIMIT_EXCEEDED;
    }

    if (error instanceof ExternalServiceError) {
      return `Layanan ${error.service || 'eksternal'} sedang bermasalah. Silakan coba lagi nanti.`;
    }

    return 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi dukungan teknis.';
  },

  /**
   * Check if error is retryable
   */
  isRetryableError(error: unknown): boolean {
    if (error instanceof RateLimitError) {
      return true;
    }

    if (error instanceof ExternalServiceError) {
      return true;
    }

    if (error instanceof Error && error.message.includes('network')) {
      return true;
    }

    return false;
  },

  /**
   * Get error status code
   */
  getStatusCode(error: unknown): number {
    if (error instanceof ValidationError) {
      return error.statusCode;
    }

    if (error instanceof AuthenticationError) {
      return error.statusCode;
    }

    if (error instanceof AuthorizationError) {
      return error.statusCode;
    }

    if (error instanceof NotFoundError) {
      return error.statusCode;
    }

    if (error instanceof ConflictError) {
      return error.statusCode;
    }

    if (error instanceof RateLimitError) {
      return error.statusCode;
    }

    if (error instanceof ExternalServiceError) {
      return error.statusCode;
    }

    return 500;
  },
};

// Global error boundary for Astro pages
export function createErrorBoundary(message: string = 'Terjadi kesalahan') {
  return (error: unknown) => {
    ErrorHandler.logError(error, { context: 'error_boundary' });

    return {
      error: ErrorHandler.handleComponentError(error),
      userMessage: ErrorHandler.getUserFriendlyMessage(error),
    };
  };
}

// Validation helper functions
export const ValidationHelpers = {
  /**
   * Validate required field
   */
  required(value: any, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new ValidationError(`${fieldName} wajib diisi`, fieldName);
    }
  },

  /**
   * Validate email format
   */
  email(value: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_INVALID_EMAIL, 'email');
    }
  },

  /**
   * Validate phone number (Indonesian format)
   */
  phone(value: string): void {
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
    if (!phoneRegex.test(value)) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_INVALID_PHONE, 'phone');
    }
  },

  /**
   * Validate password strength
   */
  password(value: string): void {
    if (value.length < 8) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_PASSWORD_TOO_WEAK, 'password');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_PASSWORD_TOO_WEAK, 'password');
    }
  },

  /**
   * Validate password confirmation
   */
  passwordConfirmation(password: string, confirmation: string): void {
    if (password !== confirmation) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_PASSWORDS_NOT_MATCH, 'confirmPassword');
    }
  },

  /**
   * Validate minimum length
   */
  minLength(value: string, minLength: number, fieldName: string): void {
    if (value.length < minLength) {
      throw new ValidationError(`${fieldName} minimal ${minLength} karakter`, fieldName);
    }
  },

  /**
   * Validate maximum length
   */
  maxLength(value: string, maxLength: number, fieldName: string): void {
    if (value.length > maxLength) {
      throw new ValidationError(`${fieldName} maksimal ${maxLength} karakter`, fieldName);
    }
  },
};

// Export all error utilities
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