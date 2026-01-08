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
      const windowStart = new Date(now.getTime() - config.windowMs);
      const windowEnd = new Date(now.getTime() + config.windowMs);

      const { data: existing, error: selectError } = await supabase
        .from(PersistentRateLimiter.TABLE_NAME)
        .select('*')
        .eq('key', key)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('[RateLimiter] Error fetching rate limit record', {
          key,
          error: selectError.message,
        });
        throw selectError;
      }

      const isExpired = !existing || new Date(existing.reset_at) < now;
      const currentCount = isExpired ? 0 : (existing?.count || 0);
      const remaining = Math.max(0, config.maxRequests - currentCount);
      const resetAt = existing && !isExpired
        ? new Date(existing.reset_at).getTime()
        : windowEnd.getTime();

      if (!isExpired && currentCount >= config.maxRequests) {
        console.warn('[RateLimiter] Rate limit exceeded', {
          key,
          count: currentCount,
          maxRequests: config.maxRequests,
        });

        return {
          allowed: false,
          remaining: 0,
          resetAt,
          resetInSeconds: Math.ceil((resetAt - now.getTime()) / 1000),
        };
      }

      const newCount = currentCount + 1;
      const newResetAt = isExpired ? windowEnd.toISOString() : existing!.reset_at;

      if (existing) {
        const { error: updateError } = await supabase
          .from(PersistentRateLimiter.TABLE_NAME)
          .update({
            count: newCount,
            reset_at: newResetAt,
          })
          .eq('key', key);

        if (updateError) {
          console.error('[RateLimiter] Error updating rate limit record', {
            key,
            error: updateError.message,
          });
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from(PersistentRateLimiter.TABLE_NAME)
          .insert({
            key,
            count: newCount,
            reset_at: newResetAt,
          });

        if (insertError) {
          if (insertError.code === '23505') {
            const { error: retryError } = await supabase
              .from(PersistentRateLimiter.TABLE_NAME)
              .update({
                count: newCount,
                reset_at: newResetAt,
              })
              .eq('key', key);

            if (retryError) {
              console.error('[RateLimiter] Error on retry insert', {
                key,
                error: retryError.message,
              });
              throw retryError;
            }
          } else {
            console.error('[RateLimiter] Error inserting rate limit record', {
              key,
              error: insertError.message,
            });
            throw insertError;
          }
        }
      }

      console.info('[RateLimiter] Rate limit check passed', {
        key,
        count: newCount,
        maxRequests: config.maxRequests,
      });

      return {
        allowed: true,
        remaining: config.maxRequests - newCount,
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
