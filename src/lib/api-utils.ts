// ==========================================================================
// AstroPro Digital - API Utilities
// Utilitas standar untuk API endpoints dengan error handling dan response format
// ==========================================================================

import type { ApiResponse, PaginatedResponse } from '../types';
import { createHmac } from 'crypto';
import DOMPurify from 'dompurify';

// API Response Helpers
export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(
  error: string,
  message?: string
): ApiResponse<never> {
  return {
    success: false,
    error,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    pagination: {
      page,
      limit,
      total,
      total_pages: totalPages,
    },
  };
}

// Error Handling
export class ApiError extends Error {
  public statusCode: number;
  public errorCode: string;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

export function handleApiError(error: unknown): ApiResponse<never> {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return createErrorResponse(error.errorCode, error.message);
  }

  if (error instanceof Error) {
    return createErrorResponse('INTERNAL_ERROR', error.message);
  }

  return createErrorResponse('INTERNAL_ERROR', 'Terjadi kesalahan internal');
}

// Validation Helpers
export function validateRequired<T>(
  value: T,
  fieldName: string
): asserts value is NonNullable<T> {
  if (value === null || value === undefined || value === '') {
    throw new ApiError(
      `Field ${fieldName} is required`,
      400,
      'VALIDATION_ERROR'
    );
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(
      'Invalid email format',
      400,
      'VALIDATION_ERROR'
    );
  }
}

export function validateUUID(uuid: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    throw new ApiError(
      'Invalid UUID format',
      400,
      'VALIDATION_ERROR'
    );
  }
}

// Request/Response Utilities
export async function parseRequestBody<T>(request: Request): Promise<T> {
  try {
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return await request.json();
    }

    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      return Object.fromEntries(formData) as T;
    }

    throw new ApiError(
      'Unsupported content type',
      400,
      'VALIDATION_ERROR'
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      'Invalid request body',
      400,
      'VALIDATION_ERROR'
    );
  }
}

export function getPaginationParams(request: Request): {
  page: number;
  limit: number;
  offset: number;
} {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get('limit') || '10'))
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function getSortParams(request: Request): {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} {
  const url = new URL(request.url);
  const sortBy = url.searchParams.get('sort_by') || undefined;
  const sortOrder = (url.searchParams.get('sort_order') || 'asc') as 'asc' | 'desc';

  return { sortBy, sortOrder };
}

export function getSearchParams(request: Request): string | undefined {
  const url = new URL(request.url);
  return url.searchParams.get('search') || undefined;
}

// Security Utilities
export function sanitizeHtml(input: string): string {
  // Use DOMPurify for comprehensive XSS protection
  // Configured to allow basic HTML elements but block scripts and dangerous attributes
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span'],
    ALLOWED_ATTR: ['href', 'title', 'class', 'style'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
  });
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Rate Limiting Helper
export const RATE_LIMITS = {
  DEFAULT: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 15 minutes, 100 requests
  AUTH: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 15 minutes, 5 requests
  PAYMENT: { windowMs: 60 * 1000, maxRequests: 10 }, // 1 minute, 10 requests
  UPLOAD: { windowMs: 60 * 1000, maxRequests: 5 }, // 1 minute, 5 requests
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

// Cache Utilities
export function getCacheKey(endpoint: string, params?: Record<string, unknown>): string {
  const paramStr = params ? JSON.stringify(params) : '';
  return `api:${endpoint}:${paramStr}`;
}

export function getCacheTTL(endpoint: string): number {
  const ttlMap: Record<string, number> = {
    '/api/projects': 5 * 60 * 1000, // 5 minutes
    '/api/user': 10 * 60 * 1000, // 10 minutes
    '/api/stats': 2 * 60 * 1000, // 2 minutes
  };

  return ttlMap[endpoint] || 5 * 60 * 1000; // Default 5 minutes
}

// Logging Utilities
export function logApiRequest(
  method: string,
  endpoint: string,
  userId?: string,
  metadata?: Record<string, unknown>
): void {
  console.log(`[${new Date().toISOString()}] ${method} ${endpoint}`, {
    userId,
    ...metadata,
  });
}

export function logApiError(
  endpoint: string,
  error: Error,
  statusCode: number,
  metadata?: Record<string, unknown>
): void {
  console.error(`[${new Date().toISOString()}] ERROR ${endpoint}`, {
    error: error.message,
    statusCode,
    stack: error.stack,
    ...metadata,
  });
}

// Response Headers
export function getCorsHeaders(origin?: string): Record<string, string> {
  const siteUrl = typeof import.meta.env !== 'undefined' ? import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321' : 'http://localhost:4321';
  const allowedOrigins = [
    siteUrl,
    'http://localhost:4321',
    'http://localhost:3000',
  ];

  // Validate and sanitize origin
  let allowedOrigin = '';
  if (origin && allowedOrigins.includes(origin)) {
    allowedOrigin = origin;
  }

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': allowedOrigin ? 'true' : 'false',
    'Access-Control-Max-Age': '86400',
  };
}

export function getSecurityHeaders(): Record<string, string> {
  const siteUrl = typeof import.meta.env !== 'undefined' ? import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321' : 'http://localhost:4321';

  // Content Security Policy - comprehensive XSS and injection protection
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' ${siteUrl}`,
    `style-src 'self' 'unsafe-inline' ${siteUrl}`,
    `img-src 'self' data: https: blob:`,
    `font-src 'self' data:`,
    "connect-src 'self' https://*.supabase.co https://*.midtrans.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "report-uri /api/csp-report"
  ].join('; ');

  return {
    'Content-Security-Policy': cspDirectives,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };
}

export function getApiResponseHeaders(origin?: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...getCorsHeaders(origin),
    ...getSecurityHeaders(),
  };
}

// Database Query Helpers
export function buildWhereClause(
  filters: Record<string, unknown>
): Record<string, unknown> {
  const whereClause: Record<string, unknown> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        whereClause[key] = { in: value };
      } else if (typeof value === 'string' && value.includes('%')) {
        whereClause[key] = { like: value };
      } else {
        whereClause[key] = value;
      }
    }
  });

  return whereClause;
}

export function buildOrderByClause(sortBy?: string, sortOrder?: string) {
  if (!sortBy) return { created_at: 'desc' };

  return {
    [sortBy]: sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc',
  };
}

// File Upload Utilities
export function validateFileUpload(file: File): void {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (file.size > maxSize) {
    throw new ApiError(
      'File size too large',
      400,
      'VALIDATION_ERROR'
    );
  }

  if (!allowedTypes.includes(file.type)) {
    throw new ApiError(
      'File type not allowed',
      400,
      'VALIDATION_ERROR'
    );
  }
}

export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
}

// Webhook Utilities
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // In production, use proper cryptographic verification
  // This is a simplified example
  const expectedSignature = `sha256=${createHmac('sha256', secret)
    .update(payload)
    .digest('hex')}`;

  return signature === expectedSignature;
}

// Export all utilities as a single object for convenience
export const ApiUtils = {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  handleApiError,
  validateRequired,
  validateEmail,
  validateUUID,
  parseRequestBody,
  getPaginationParams,
  getSortParams,
  getSearchParams,
  sanitizeHtml,
  generateSlug,
  getCacheKey,
  getCacheTTL,
  logApiRequest,
  logApiError,
  getApiResponseHeaders,
  buildWhereClause,
  buildOrderByClause,
  validateFileUpload,
  generateFileName,
  verifyWebhookSignature,
};