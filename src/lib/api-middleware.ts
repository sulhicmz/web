// ==========================================================================
// AstroPro Digital - API Integration Middleware
// Middleware for API endpoints with resilience patterns and error handling
// ==========================================================================

import type { APIRoute } from 'astro';
import { ErrorHandler } from './error-handler';
import { ResilientHttpClient } from './integration/http-client';

export interface MiddlewareOptions {
  enableLogging?: boolean;
  enableErrorHandling?: boolean;
  enableRateLimiting?: boolean;
  enableCircuitBreaker?: boolean;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface RequestContext {
  method: string;
  url: string;
  headers: Headers;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

export const DEFAULT_MIDDLEWARE_OPTIONS: MiddlewareOptions = {
  enableLogging: true,
  enableErrorHandling: true,
  enableRateLimiting: true,
  enableCircuitBreaker: false,
  timeoutMs: 30000,
  maxRetries: 3,
};

export class ApiMiddleware {
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(private options: MiddlewareOptions = {}) {
    this.options = { ...DEFAULT_MIDDLEWARE_OPTIONS, ...options };
  }

  async handleRequest<T>(
    request: Request,
    handler: (context: RequestContext) => Promise<T>
  ): Promise<Response> {
    const context = this.buildContext(request);

    try {
      if (this.options.enableLogging) {
        this.logRequest(context);
      }

      if (this.options.enableRateLimiting) {
        this.checkRateLimit(context);
      }

      const data = await handler(context);

      if (data instanceof Response) {
        return data;
      }

      return this.createSuccessResponse(data);
    } catch (error) {
      return this.handleError(error, context);
    }
  }

  private buildContext(request: Request): RequestContext {
    const url = new URL(request.url);
    const ip = request.headers.get('cf-connecting-ip') ||
               request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    return {
      method: request.method,
      url: request.url,
      headers: request.headers,
      ip,
      userAgent,
    };
  }

  private logRequest(context: RequestContext): void {
    console.info(`[API] ${context.method} ${new URL(context.url).pathname}`, {
      ip: context.ip,
      userAgent: context.userAgent,
    });
  }

  private checkRateLimit(context: RequestContext): void {
    const key = `${context.ip}:${context.url}`;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const maxRequests = 100;

    const record = this.rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return;
    }

    if (record.count >= maxRequests) {
      const resetIn = Math.ceil((record.resetTime - now) / 1000);
      throw new Error(
        `Rate limit exceeded. Try again in ${resetIn} seconds.`
      );
    }

    record.count++;
  }

  private handleError(error: unknown, context: RequestContext): Response {
    if (this.options.enableLogging) {
      this.logError(error, context);
    }

    const errorResponse = ErrorHandler.handleApiError(error);

    return new Response(JSON.stringify(errorResponse), {
      status: ErrorHandler.getStatusCode(error),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private logError(error: unknown, context: RequestContext): void {
    console.error('[API Error]', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      context: {
        method: context.method,
        url: context.url,
        ip: context.ip,
      },
    });
  }

  private createSuccessResponse<T>(data: T): Response {
    return new Response(JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export function createApiMiddleware(options?: MiddlewareOptions): ApiMiddleware {
  return new ApiMiddleware(options);
}

export function withMiddleware<T>(
  handler: (request: Request, context: RequestContext) => Promise<T>,
  options?: MiddlewareOptions
): APIRoute {
  const middleware = createApiMiddleware(options);

  return async (context) => {
    return middleware.handleRequest(context.request, (reqContext) =>
      handler(context.request, reqContext)
    );
  };
}

export function withRateLimit(
  handler: APIRoute,
  windowMs: number = 15 * 60 * 1000,
  maxRequests: number = 100
): APIRoute {
  const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  return async (context) => {
    const request = context.request;
    const ip = request.headers.get('cf-connecting-ip') ||
               request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               'unknown';
    const key = `${ip}:${request.url}`;
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
    } else if (record.count >= maxRequests) {
      const resetIn = Math.ceil((record.resetTime - now) / 1000);

      return new Response(JSON.stringify({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
        timestamp: new Date().toISOString(),
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': resetIn.toString(),
        },
      });
    } else {
      record.count++;
    }

    return handler(context);
  };
}

export function withTimeout(
  handler: APIRoute,
  timeoutMs: number = 30000
): APIRoute {
  return async (context) => {
    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    try {
      return await Promise.race([
        handler(context),
        timeoutPromise,
      ]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        return new Response(JSON.stringify({
          success: false,
          error: 'TIMEOUT',
          message: 'Request took too long to process',
          timestamp: new Date().toISOString(),
        }), {
          status: 504,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw error;
    }
  };
}

export function withCircuitBreaker<T>(
  handler: (request: Request) => Promise<T>,
  options: { failureThreshold?: number; timeoutMs?: number } = {}
): (request: Request) => Promise<T> {
  const failureThreshold = options.failureThreshold || 5;
  const timeoutMs = options.timeoutMs || 30000;

  let failures = 0;
  let lastFailureTime = 0;
  let circuitOpen = false;

  return async (request: Request) => {
    const now = Date.now();

    if (circuitOpen && now - lastFailureTime < timeoutMs) {
      throw new Error('Circuit breaker is open');
    }

    if (circuitOpen && now - lastFailureTime >= timeoutMs) {
      circuitOpen = false;
      failures = 0;
    }

    try {
      const result = await handler(request);

      failures = 0;
      circuitOpen = false;

      return result;
    } catch (error) {
      failures++;
      lastFailureTime = now;

      if (failures >= failureThreshold) {
        circuitOpen = true;
        console.warn(`[Circuit Breaker] Circuit opened after ${failures} failures`);
      }

      throw error;
    }
  };
}

export const ApiMiddlewareUtils = {
  ApiMiddleware,
  createApiMiddleware,
  withMiddleware,
  withRateLimit,
  withTimeout,
  withCircuitBreaker,
  DEFAULT_MIDDLEWARE_OPTIONS,
};
