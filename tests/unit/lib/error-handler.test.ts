import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  ErrorHandler,
  createErrorBoundary,
} from '../../../src/lib/error-handler';
import { ERROR_MESSAGES } from '../../../src/config';

describe('Error Classes', () => {
  describe('ValidationError', () => {
    it('should create ValidationError with message and field', () => {
      const error = new ValidationError('Invalid email', 'email');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid email');
      expect(error.field).toBe('email');
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should create ValidationError without field', () => {
      const error = new ValidationError('Invalid input');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid input');
      expect(error.field).toBeUndefined();
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
    });
  });

  describe('AuthenticationError', () => {
    it('should create AuthenticationError with default message', () => {
      const error = new AuthenticationError();
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('AuthenticationError');
      expect(error.message).toBe(ERROR_MESSAGES.AUTH_UNAUTHORIZED);
      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe('AUTHENTICATION_ERROR');
    });

    it('should create AuthenticationError with custom message', () => {
      const error = new AuthenticationError('Invalid credentials');
      expect(error.message).toBe('Invalid credentials');
      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe('AUTHENTICATION_ERROR');
    });
  });

  describe('AuthorizationError', () => {
    it('should create AuthorizationError with default message', () => {
      const error = new AuthorizationError();
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('AuthorizationError');
      expect(error.message).toBe(ERROR_MESSAGES.AUTH_UNAUTHORIZED);
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe('AUTHORIZATION_ERROR');
    });

    it('should create AuthorizationError with custom message', () => {
      const error = new AuthorizationError('Access denied');
      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe('AUTHORIZATION_ERROR');
    });
  });

  describe('NotFoundError', () => {
    it('should create NotFoundError with default message', () => {
      const error = new NotFoundError();
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe(ERROR_MESSAGES.NOT_FOUND);
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe('NOT_FOUND');
    });

    it('should create NotFoundError with custom message', () => {
      const error = new NotFoundError('User not found');
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe('NOT_FOUND');
    });
  });

  describe('ConflictError', () => {
    it('should create ConflictError with message', () => {
      const error = new ConflictError('Resource already exists');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ConflictError');
      expect(error.message).toBe('Resource already exists');
      expect(error.statusCode).toBe(409);
      expect(error.errorCode).toBe('CONFLICT');
    });
  });

  describe('RateLimitError', () => {
    it('should create RateLimitError with default message', () => {
      const error = new RateLimitError();
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('RateLimitError');
      expect(error.message).toBe(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED);
      expect(error.statusCode).toBe(429);
      expect(error.errorCode).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should create RateLimitError with custom message', () => {
      const error = new RateLimitError('Too many requests');
      expect(error.message).toBe('Too many requests');
      expect(error.statusCode).toBe(429);
      expect(error.errorCode).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('ExternalServiceError', () => {
    it('should create ExternalServiceError with message and service', () => {
      const error = new ExternalServiceError('Service unavailable', 'Midtrans');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ExternalServiceError');
      expect(error.message).toBe('Service unavailable');
      expect(error.service).toBe('Midtrans');
      expect(error.statusCode).toBe(502);
      expect(error.errorCode).toBe('EXTERNAL_SERVICE_ERROR');
    });

    it('should create ExternalServiceError without service', () => {
      const error = new ExternalServiceError('Service unavailable');
      expect(error.message).toBe('Service unavailable');
      expect(error.service).toBeUndefined();
      expect(error.statusCode).toBe(502);
      expect(error.errorCode).toBe('EXTERNAL_SERVICE_ERROR');
    });
  });
});

describe('ErrorHandler.handleApiError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should handle ValidationError correctly', () => {
    const error = new ValidationError('Invalid email', 'email');
    const result = ErrorHandler.handleApiError(error);
    expect(result.success).toBe(false);
    expect(result.error).toBe('VALIDATION_ERROR');
    expect(result.message).toBe('Invalid email');
    expect(result.timestamp).toBeDefined();
  });

  it('should handle AuthenticationError correctly', () => {
    const error = new AuthenticationError('Unauthorized');
    const result = ErrorHandler.handleApiError(error);
    expect(result.success).toBe(false);
    expect(result.error).toBe('AUTHENTICATION_ERROR');
    expect(result.message).toBe('Unauthorized');
    expect(result.timestamp).toBeDefined();
  });

  it('should handle AuthorizationError correctly', () => {
    const error = new AuthorizationError('Access denied');
    const result = ErrorHandler.handleApiError(error);
    expect(result.success).toBe(false);
    expect(result.error).toBe('AUTHORIZATION_ERROR');
    expect(result.message).toBe('Access denied');
    expect(result.timestamp).toBeDefined();
  });

  it('should handle NotFoundError correctly', () => {
    const error = new NotFoundError('Not found');
    const result = ErrorHandler.handleApiError(error);
    expect(result.success).toBe(false);
    expect(result.error).toBe('NOT_FOUND');
    expect(result.message).toBe('Not found');
    expect(result.timestamp).toBeDefined();
  });

  it('should handle ConflictError correctly', () => {
    const error = new ConflictError('Conflict');
    const result = ErrorHandler.handleApiError(error);
    expect(result.success).toBe(false);
    expect(result.error).toBe('CONFLICT');
    expect(result.message).toBe('Conflict');
    expect(result.timestamp).toBeDefined();
  });

  it('should handle RateLimitError correctly', () => {
    const error = new RateLimitError('Rate limit');
    const result = ErrorHandler.handleApiError(error);
    expect(result.success).toBe(false);
    expect(result.error).toBe('RATE_LIMIT_EXCEEDED');
    expect(result.message).toBe('Rate limit');
    expect(result.timestamp).toBeDefined();
  });

  it('should handle ExternalServiceError correctly', () => {
    const error = new ExternalServiceError('Service error', 'Midtrans');
    const result = ErrorHandler.handleApiError(error);
    expect(result.success).toBe(false);
    expect(result.error).toBe('EXTERNAL_SERVICE_ERROR');
    expect(result.message).toBe('Service error');
    expect(result.timestamp).toBeDefined();
  });

  it('should handle standard Error correctly', () => {
    const error = new Error('Something went wrong');
    const result = ErrorHandler.handleApiError(error);
    expect(result.success).toBe(false);
    expect(result.error).toBe('INTERNAL_ERROR');
    expect(result.message).toBe('Something went wrong');
    expect(result.timestamp).toBeDefined();
  });

  it('should handle unknown error correctly', () => {
    const error = 'string error';
    const result = ErrorHandler.handleApiError(error);
    expect(result.success).toBe(false);
    expect(result.error).toBe('INTERNAL_ERROR');
    expect(result.message).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
    expect(result.timestamp).toBeDefined();
  });

  it('should handle null error correctly', () => {
    const result = ErrorHandler.handleApiError(null);
    expect(result.success).toBe(false);
    expect(result.error).toBe('INTERNAL_ERROR');
    expect(result.message).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
    expect(result.timestamp).toBeDefined();
  });

  it('should log error to console', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    const error = new Error('Test error');
    ErrorHandler.handleApiError(error);
    expect(consoleSpy).toHaveBeenCalledWith('API Error:', error);
  });

  it('should generate ISO timestamp', () => {
    const error = new Error('Test');
    const result = ErrorHandler.handleApiError(error);
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});

describe('ErrorHandler.handleMiddlewareError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should handle AuthenticationError correctly', async () => {
    const error = new AuthenticationError('Unauthorized');
    const response = ErrorHandler.handleMiddlewareError(error);
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(401);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const body = await response.json() as Record<string, string>;
    expect(body.error).toBe('AUTHENTICATION_ERROR');
    expect(body.message).toBe('Unauthorized');
  });

  it('should handle AuthorizationError correctly', async () => {
    const error = new AuthorizationError('Access denied');
    const response = ErrorHandler.handleMiddlewareError(error);
    expect(response.status).toBe(403);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const body = await response.json() as Record<string, string>;
    expect(body.error).toBe('AUTHORIZATION_ERROR');
    expect(body.message).toBe('Access denied');
  });

  it('should handle RateLimitError correctly', async () => {
    const error = new RateLimitError('Rate limit');
    const response = ErrorHandler.handleMiddlewareError(error);
    expect(response.status).toBe(429);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const body = await response.json() as Record<string, string>;
    expect(body.error).toBe('RATE_LIMIT_EXCEEDED');
    expect(body.message).toBe('Rate limit');
  });

  it('should handle standard errors with 500 status', async () => {
    const error = new Error('Internal error');
    const response = ErrorHandler.handleMiddlewareError(error);
    expect(response.status).toBe(500);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const body = await response.json() as Record<string, string>;
    expect(body.error).toBe('INTERNAL_ERROR');
    expect(body.message).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
  });

  it('should handle unknown errors with 500 status', async () => {
    const error = 'unknown error';
    const response = ErrorHandler.handleMiddlewareError(error);
    expect(response.status).toBe(500);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const body = await response.json() as Record<string, string>;
    expect(body.error).toBe('INTERNAL_ERROR');
    expect(body.message).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
  });

  it('should log error to console', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    const error = new Error('Test error');
    ErrorHandler.handleMiddlewareError(error);
    expect(consoleSpy).toHaveBeenCalledWith('Middleware Error:', error);
  });
});

describe('ErrorHandler.handleComponentError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should handle Error correctly', () => {
    const error = new Error('Component error');
    const result = ErrorHandler.handleComponentError(error);
    expect(result.code).toBe('COMPONENT_ERROR');
    expect(result.message).toBe('Component error');
    expect(result.timestamp).toBeDefined();
  });

  it('should handle unknown error correctly', () => {
    const result = ErrorHandler.handleComponentError('string error');
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.message).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
    expect(result.timestamp).toBeDefined();
  });

  it('should handle null error correctly', () => {
    const result = ErrorHandler.handleComponentError(null);
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.message).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
    expect(result.timestamp).toBeDefined();
  });

  it('should log error to console', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    const error = new Error('Test error');
    ErrorHandler.handleComponentError(error);
    expect(consoleSpy).toHaveBeenCalledWith('Component Error:', error);
  });

  it('should include error details when Error instance', () => {
    const error = new Error('Test error');
    error.stack = 'Error: Test error\n    at test.ts:1:1';
    const result = ErrorHandler.handleComponentError(error);
    expect(result.code).toBe('COMPONENT_ERROR');
    expect(result.message).toBe('Test error');
  });
});

describe('ErrorHandler.logError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should log Error instance with details', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    const error = new Error('Test error');
    const context = { userId: '123', action: 'login' };
    ErrorHandler.logError(error, context);
    expect(consoleSpy).toHaveBeenCalledWith('Application Error:', expect.objectContaining({
      error: expect.objectContaining({
        name: 'Error',
        message: 'Test error',
        stack: expect.any(String),
      }),
      context,
      timestamp: expect.any(String),
    }));
  });

  it('should log non-Error instance', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    const error = 'string error';
    ErrorHandler.logError(error);
    expect(consoleSpy).toHaveBeenCalledWith('Application Error:', expect.objectContaining({
      error: 'string error',
      timestamp: expect.any(String),
    }));
  });

  it('should log error without context', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    const error = new Error('Test');
    ErrorHandler.logError(error);
    expect(consoleSpy).toHaveBeenCalledWith('Application Error:', expect.objectContaining({
      error: expect.any(Object),
      timestamp: expect.any(String),
    }));
  });

  it('should include userAgent in browser environment', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockClear();
    const error = new Error('Test');
    ErrorHandler.logError(error);
    const loggedData = consoleSpy.mock.calls[0][1] as Record<string, unknown>;
    expect(loggedData.userAgent).toBeDefined();
  });

  it('should include context in log', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    const error = new Error('Test');
    const context = { userId: '123', action: 'update' };
    ErrorHandler.logError(error, context);
    expect(consoleSpy).toHaveBeenCalledWith('Application Error:', expect.objectContaining({
      context,
    }));
  });
});

describe('ErrorHandler.getUserFriendlyMessage', () => {
  it('should return message for ValidationError', () => {
    const error = new ValidationError('Invalid field');
    expect(ErrorHandler.getUserFriendlyMessage(error)).toBe('Invalid field');
  });

  it('should return AUTH_INVALID_CREDENTIALS for AuthenticationError', () => {
    const error = new AuthenticationError();
    expect(ErrorHandler.getUserFriendlyMessage(error)).toBe(ERROR_MESSAGES.AUTH_INVALID_CREDENTIALS);
  });

  it('should return AUTH_UNAUTHORIZED for AuthorizationError', () => {
    const error = new AuthorizationError();
    expect(ErrorHandler.getUserFriendlyMessage(error)).toBe(ERROR_MESSAGES.AUTH_UNAUTHORIZED);
  });

  it('should return NOT_FOUND for NotFoundError', () => {
    const error = new NotFoundError();
    expect(ErrorHandler.getUserFriendlyMessage(error)).toBe(ERROR_MESSAGES.NOT_FOUND);
  });

  it('should return RATE_LIMIT_EXCEEDED for RateLimitError', () => {
    const error = new RateLimitError();
    expect(ErrorHandler.getUserFriendlyMessage(error)).toBe(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED);
  });

  it('should return service-specific message for ExternalServiceError with service', () => {
    const error = new ExternalServiceError('Error', 'Midtrans');
    expect(ErrorHandler.getUserFriendlyMessage(error)).toBe('Layanan Midtrans sedang bermasalah. Silakan coba lagi nanti.');
  });

  it('should return generic message for ExternalServiceError without service', () => {
    const error = new ExternalServiceError('Error');
    expect(ErrorHandler.getUserFriendlyMessage(error)).toBe('Layanan eksternal sedang bermasalah. Silakan coba lagi nanti.');
  });

  it('should return generic message for standard Error', () => {
    const error = new Error('Technical error');
    expect(ErrorHandler.getUserFriendlyMessage(error)).toBe('Terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi dukungan teknis.');
  });

  it('should return generic message for unknown error', () => {
    expect(ErrorHandler.getUserFriendlyMessage('string error')).toBe('Terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi dukungan teknis.');
  });

  it('should return generic message for null', () => {
    expect(ErrorHandler.getUserFriendlyMessage(null)).toBe('Terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi dukungan teknis.');
  });
});

describe('ErrorHandler.isRetryableError', () => {
  it('should return true for RateLimitError', () => {
    const error = new RateLimitError();
    expect(ErrorHandler.isRetryableError(error)).toBe(true);
  });

  it('should return true for ExternalServiceError', () => {
    const error = new ExternalServiceError('Service error');
    expect(ErrorHandler.isRetryableError(error)).toBe(true);
  });

  it('should return true for network errors', () => {
    const error = new Error('network connection failed');
    expect(ErrorHandler.isRetryableError(error)).toBe(true);
  });

  it('should return true for errors with network in message', () => {
    const error = new Error('network timeout occurred');
    expect(ErrorHandler.isRetryableError(error)).toBe(true);
  });

  it('should return false for ValidationError', () => {
    const error = new ValidationError('Invalid data');
    expect(ErrorHandler.isRetryableError(error)).toBe(false);
  });

  it('should return false for AuthenticationError', () => {
    const error = new AuthenticationError();
    expect(ErrorHandler.isRetryableError(error)).toBe(false);
  });

  it('should return false for standard Error without network', () => {
    const error = new Error('Application error');
    expect(ErrorHandler.isRetryableError(error)).toBe(false);
  });

  it('should return false for unknown errors', () => {
    expect(ErrorHandler.isRetryableError('string error')).toBe(false);
  });

  it('should return false for null', () => {
    expect(ErrorHandler.isRetryableError(null)).toBe(false);
  });
});

describe('ErrorHandler.getStatusCode', () => {
  it('should return 400 for ValidationError', () => {
    const error = new ValidationError('Invalid');
    expect(ErrorHandler.getStatusCode(error)).toBe(400);
  });

  it('should return 401 for AuthenticationError', () => {
    const error = new AuthenticationError();
    expect(ErrorHandler.getStatusCode(error)).toBe(401);
  });

  it('should return 403 for AuthorizationError', () => {
    const error = new AuthorizationError();
    expect(ErrorHandler.getStatusCode(error)).toBe(403);
  });

  it('should return 404 for NotFoundError', () => {
    const error = new NotFoundError();
    expect(ErrorHandler.getStatusCode(error)).toBe(404);
  });

  it('should return 409 for ConflictError', () => {
    const error = new ConflictError('Conflict');
    expect(ErrorHandler.getStatusCode(error)).toBe(409);
  });

  it('should return 429 for RateLimitError', () => {
    const error = new RateLimitError();
    expect(ErrorHandler.getStatusCode(error)).toBe(429);
  });

  it('should return 502 for ExternalServiceError', () => {
    const error = new ExternalServiceError('Service error');
    expect(ErrorHandler.getStatusCode(error)).toBe(502);
  });

  it('should return 500 for standard Error', () => {
    const error = new Error('Internal error');
    expect(ErrorHandler.getStatusCode(error)).toBe(500);
  });

  it('should return 500 for unknown errors', () => {
    expect(ErrorHandler.getStatusCode('string error')).toBe(500);
  });

  it('should return 500 for null', () => {
    expect(ErrorHandler.getStatusCode(null)).toBe(500);
  });
});

describe('createErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should create error boundary with default message', () => {
    const boundary = createErrorBoundary();
    expect(typeof boundary).toBe('function');
  });

  it('should create error boundary with custom message', () => {
    const boundary = createErrorBoundary('Custom error message');
    expect(typeof boundary).toBe('function');
  });

  it('should handle Error and return error object', () => {
    const boundary = createErrorBoundary();
    const error = new Error('Test error');
    const result = boundary(error);

    expect(result).toHaveProperty('error');
    expect(result).toHaveProperty('userMessage');
    expect(result.error.code).toBe('COMPONENT_ERROR');
    expect(result.error.message).toBe('Test error');
    expect(result.error.timestamp).toBeDefined();
  });

  it('should handle unknown error', () => {
    const boundary = createErrorBoundary();
    const result = boundary('unknown error');

    expect(result.error.code).toBe('UNKNOWN_ERROR');
    expect(result.error.message).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
    expect(result.userMessage).toBeDefined();
  });

  it('should log error with context', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockClear();
    const boundary = createErrorBoundary();
    const error = new Error('Test');
    boundary(error);

    expect(consoleSpy).toHaveBeenCalledWith('Application Error:', expect.objectContaining({
      context: { context: 'error_boundary' },
    }));
  });

  it('should provide user-friendly message', () => {
    const boundary = createErrorBoundary();
    const error = new ValidationError('Invalid input');
    const result = boundary(error);

    expect(result.userMessage).toBe('Invalid input');
  });

  it('should provide generic user message for unknown errors', () => {
    const boundary = createErrorBoundary();
    const result = boundary('unknown');

    expect(result.userMessage).toBe('Terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi dukungan teknis.');
  });
});
