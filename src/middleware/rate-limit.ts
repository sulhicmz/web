import { PersistentRateLimiter, DEFAULT_RATE_LIMIT_CONFIGS } from '../lib/integration/rate-limiter';
import type { MiddlewareHandler } from 'astro';

type RateLimitType = 'default' | 'payment' | 'webhook' | 'auth' | 'api';

export async function withPersistentRateLimit(
  handler: MiddlewareHandler,
  type: RateLimitType = 'api'
): Promise<MiddlewareHandler> {
  const limiter = new PersistentRateLimiter();
  const config = DEFAULT_RATE_LIMIT_CONFIGS[type];

  return async ({ request }, next) => {
    try {
      const clientIP = request.headers.get('cf-connecting-ip') ||
                       request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                       request.headers.get('x-real-ip') ||
                       'unknown';

      const key = `${type}:${clientIP}:${request.method}:${new URL(request.url).pathname}`;

      const result = await limiter.check(key, config);

      if (!result.allowed) {
        return new Response(JSON.stringify({
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          retryAfter: result.resetInSeconds,
          timestamp: new Date().toISOString(),
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': result.resetInSeconds.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
          },
        });
      }

      const response = await next();

      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(result.resetAt).toISOString());

      return response;
    } catch (error) {
      console.error('[RateLimitMiddleware] Error checking rate limit', {
        error: error instanceof Error ? error.message : String(error),
        url: request.url,
      });

      return next();
    }
  };
}
