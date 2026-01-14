// ==========================================================================
// AstroPro Digital - Persistent Rate Limiter
// Rate limiting with persistent storage (Supabase)
// ==========================================================================

import { getServiceClient } from '../supabase/server';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  burstAllowance?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  resetInSeconds: number;
}

export interface RateLimitRecord {
  id: string;
  key: string;
  count: number;
  reset_at: string;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  default: { windowMs: 15 * 60 * 1000, maxRequests: 100, burstAllowance: 20 },
  payment: { windowMs: 60 * 60 * 1000, maxRequests: 10, burstAllowance: 5 },
  webhook: { windowMs: 60 * 1000, maxRequests: 10, burstAllowance: 2 },
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 20, burstAllowance: 5 },
  api: { windowMs: 15 * 60 * 1000, maxRequests: 100, burstAllowance: 20 },
};

export class PersistentRateLimiter {
  private static readonly TABLE_NAME = 'rate_limits';

  constructor(
    private readonly supabase = getServiceClient()
  ) {}

  async check(
    key: string,
    config: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIGS.default
  ): Promise<RateLimitResult> {
    try {
      const supabase = this.supabase;
      const now = new Date();
      const windowEnd = new Date(now.getTime() + config.windowMs);
      const windowEndIso = windowEnd.toISOString();

      const { data: existing, error: checkError } = await supabase
        .rpc('check_and_increment_rate_limit', {
          p_key: key,
          p_window_ms: config.windowMs,
          p_max_requests: config.maxRequests,
          p_reset_at: windowEndIso,
        });

      if (checkError) {
        console.error('[RateLimiter] Error in check_and_increment_rate_limit', {
          key,
          error: checkError.message,
        });
        throw checkError;
      }

      const allowed = existing?.allowed ?? false;
      const remaining = existing?.remaining ?? 0;
      const resetAt = existing?.reset_at ? new Date(existing.reset_at).getTime() : windowEnd.getTime();

      if (!allowed) {
        console.warn('[RateLimiter] Rate limit exceeded', {
          key,
          remaining,
          resetAt,
        });
      } else {
        console.info('[RateLimiter] Rate limit check passed', {
          key,
          remaining,
        });
      }

      return {
        allowed,
        remaining,
        resetAt,
        resetInSeconds: Math.ceil((resetAt - now.getTime()) / 1000),
      };
    } catch (error) {
      console.error('[RateLimiter] Fatal error in check method', {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async reset(key: string): Promise<void> {
    try {
      const supabase = this.supabase;

      const { error } = await supabase
        .from(PersistentRateLimiter.TABLE_NAME)
        .delete()
        .eq('key', key);

      if (error) {
        console.error('[RateLimiter] Error resetting rate limit', {
          key,
          error: error.message,
        });
        throw error;
      }

      console.info('[RateLimiter] Rate limit reset', { key });
    } catch (error) {
      console.error('[RateLimiter] Fatal error in reset method', {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getCurrentLimit(key: string): Promise<{
    count: number;
    maxRequests: number;
    resetAt: number;
  } | null> {
    try {
      const supabase = this.supabase;

      const { data, error } = await supabase
        .from(PersistentRateLimiter.TABLE_NAME)
        .select('*')
        .eq('key', key)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        return null;
      }

      const now = new Date();
      const resetAt = new Date(data.reset_at);

      if (resetAt < now) {
        return { count: 0, maxRequests: 100, resetAt: now.getTime() + 15 * 60 * 1000 };
      }

      const config = DEFAULT_RATE_LIMIT_CONFIGS.default;
      return {
        count: data.count,
        maxRequests: config.maxRequests,
        resetAt: resetAt.getTime(),
      };
    } catch (error) {
      console.error('[RateLimiter] Error getting current limit', {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  async cleanupExpiredRecords(): Promise<number> {
    try {
      const supabase = this.supabase;

      const now = new Date();

      const { count, error } = await supabase
        .from(PersistentRateLimiter.TABLE_NAME)
        .delete()
        .lte('reset_at', now.toISOString());

      if (error) {
        throw error;
      }

      console.info('[RateLimiter] Cleanup completed', { count: count || 0 });
      return count || 0;
    } catch (error) {
      console.error('[RateLimiter] Error during cleanup', {
        error: error instanceof Error ? error.message : String(error),
      });
      return 0;
    }
  }

  static async initialize(): Promise<void> {
    try {
      const supabase = getServiceClient();

      const { error: tableError } = await supabase.rpc('check_table_exists', {
        table_name: PersistentRateLimiter.TABLE_NAME,
      });

      if (tableError) {
        console.warn('[RateLimiter] Table check failed, initializing table');
        const { error: createError } = await supabase.rpc('create_rate_limits_table');

        if (createError) {
          console.error('[RateLimiter] Failed to create rate limits table', {
            error: createError.message,
          });
        }
      }
    } catch (error) {
      console.error('[RateLimiter] Error initializing rate limiter', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export const persistentRateLimiter = new PersistentRateLimiter();
