// ==========================================================================
// AstroPro Digital - Webhook Metrics Service
// Provides metrics for monitoring webhook processing
// ==========================================================================

import { getServiceClient } from '../supabase/server';
import { webhookDeduplicationService, type WebhookRetryQueueRecord } from './webhook-deduplication';
import { deadLetterQueueHandler } from './dead-letter-handler';

export interface WebhookMetrics {
  processed: number;
  duplicates: number;
  retryQueue: RetryQueueMetrics;
  deadLetterQueue: DeadLetterQueueMetrics;
  rateLimits: RateLimitMetrics;
}

export interface RetryQueueMetrics {
  pending: number;
  processing: number;
  succeeded: number;
  failed: number;
  oldestRetry: string | null;
  newestRetry: string | null;
}

export interface DeadLetterQueueMetrics {
  total: number;
  payment: number;
  whatsapp: number;
  processed: number;
  unprocessed: number;
  oldest: string | null;
  newest: string | null;
}

export interface RateLimitMetrics {
  activeLimits: number;
  expiredLimits: number;
}

export class WebhookMetricsService {
  constructor(
    private readonly supabase = getServiceClient()
  ) {}

  async getMetrics(): Promise<WebhookMetrics> {
    try {
      const [
        processedCount,
        duplicatesCount,
        retryStats,
        retryQueueInfo,
        deadLetterStats,
        deadLetterQueueInfo,
        rateLimitMetrics,
      ] = await Promise.all([
        this.getProcessedWebhookCount(),
        this.getDuplicateWebhookCount(),
        webhookDeduplicationService.getRetryStats(),
        this.getRetryQueueInfo(),
        deadLetterQueueHandler.getDeadLetterStats(),
        this.getDeadLetterQueueInfo(),
        this.getRateLimitMetrics(),
      ]);

      return {
        processed: processedCount,
        duplicates: duplicatesCount,
        retryQueue: {
          ...retryStats,
          oldestRetry: retryQueueInfo.oldest,
          newestRetry: retryQueueInfo.newest,
        },
        deadLetterQueue: {
          ...deadLetterStats,
          oldest: deadLetterQueueInfo.oldest,
          newest: deadLetterQueueInfo.newest,
        },
        rateLimits: rateLimitMetrics,
      };
    } catch (error) {
      console.error('[WebhookMetrics] Error fetching metrics', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async getProcessedWebhookCount(): Promise<number> {
    try {
      const supabase = this.supabase;

      const { count, error } = await supabase
        .from('payment_webhook_dedup')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('[WebhookMetrics] Error getting processed webhook count', {
        error: error instanceof Error ? error.message : String(error),
      });
      return 0;
    }
  }

  private async getDuplicateWebhookCount(): Promise<number> {
    const supabase = this.supabase;

    const { count, error } = await supabase
      .from('payment_webhook_dedup')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('[WebhookMetrics] Error getting duplicate webhook count', {
        error: error instanceof Error ? error.message : String(error),
      });
      return 0;
    }

    return count || 0;
  }

  private async getRetryQueueInfo(): Promise<{
    oldest: string | null;
    newest: string | null;
  }> {
    try {
      const supabase = this.supabase;

      const { data, error } = await supabase
        .from('payment_webhook_retry_queue')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      const newest = data && data.length > 0 ? data[0].created_at : null;

      const { data: oldestData, error: oldestError } = await supabase
        .from('payment_webhook_retry_queue')
        .select('created_at')
        .order('created_at', { ascending: true })
        .limit(1);

      if (oldestError) {
        throw oldestError;
      }

      const oldest =
        oldestData && oldestData.length > 0 ? oldestData[0].created_at : null;

      return { oldest, newest };
    } catch (error) {
      console.error('[WebhookMetrics] Error getting retry queue info', {
        error: error instanceof Error ? error.message : String(error),
      });
      return { oldest: null, newest: null };
    }
  }

  private async getDeadLetterQueueInfo(): Promise<{
    oldest: string | null;
    newest: string | null;
  }> {
    try {
      const supabase = this.supabase;

      const { data, error } = await supabase
        .from('webhook_dead_letter_queue')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      const newest = data && data.length > 0 ? data[0].created_at : null;

      const { data: oldestData, error: oldestError } = await supabase
        .from('webhook_dead_letter_queue')
        .select('created_at')
        .order('created_at', { ascending: true })
        .limit(1);

      if (oldestError) {
        throw oldestError;
      }

      const oldest =
        oldestData && oldestData.length > 0 ? oldestData[0].created_at : null;

      return { oldest, newest };
    } catch (error) {
      console.error('[WebhookMetrics] Error getting dead-letter queue info', {
        error: error instanceof Error ? error.message : String(error),
      });
      return { oldest: null, newest: null };
    }
  }

  private async getRateLimitMetrics(): Promise<RateLimitMetrics> {
    try {
      const supabase = this.supabase;

      const now = new Date();

      const { count: activeCount, error: activeError } = await supabase
        .from('rate_limits')
        .select('*', { count: 'exact', head: true })
        .gt('reset_at', now.toISOString());

      if (activeError) {
        throw activeError;
      }

      const { count: expiredCount, error: expiredError } = await supabase
        .from('rate_limits')
        .select('*', { count: 'exact', head: true })
        .lte('reset_at', now.toISOString());

      if (expiredError) {
        throw expiredError;
      }

      return {
        activeLimits: activeCount || 0,
        expiredLimits: expiredCount || 0,
      };
    } catch (error) {
      console.error('[WebhookMetrics] Error getting rate limit metrics', {
        error: error instanceof Error ? error.message : String(error),
      });
      return { activeLimits: 0, expiredLimits: 0 };
    }
  }

  async getDetailedRetryQueue(limit: number = 20): Promise<WebhookRetryQueueRecord[]> {
    try {
      const supabase = this.supabase;

      const { data, error } = await supabase
        .from('payment_webhook_retry_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data || []) as WebhookRetryQueueRecord[];
    } catch (error) {
      console.error('[WebhookMetrics] Error getting detailed retry queue', {
        limit,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    issues: string[];
    metrics: WebhookMetrics;
  }> {
    try {
      const metrics = await this.getMetrics();
      const issues: string[] = [];

      if (metrics.retryQueue.failed > 10) {
        issues.push(
          `High number of failed webhooks in retry queue: ${metrics.retryQueue.failed}`
        );
      }

      if (metrics.deadLetterQueue.unprocessed > 5) {
        issues.push(
          `Unprocessed dead-letter queue items: ${metrics.deadLetterQueue.unprocessed}`
        );
      }

      if (metrics.retryQueue.pending > 100) {
        issues.push(
          `High number of pending retry webhooks: ${metrics.retryQueue.pending}`
        );
      }

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

      if (issues.length === 0) {
        status = 'healthy';
      } else if (issues.length <= 2) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      return { status, issues, metrics };
    } catch (error) {
      return {
        status: 'unhealthy',
        issues: [
          `Failed to fetch metrics: ${error instanceof Error ? error.message : String(error)}`,
        ],
        metrics: {
          processed: 0,
          duplicates: 0,
          retryQueue: {
            pending: 0,
            processing: 0,
            succeeded: 0,
            failed: 0,
            oldestRetry: null,
            newestRetry: null,
          },
          deadLetterQueue: {
            total: 0,
            payment: 0,
            whatsapp: 0,
            processed: 0,
            unprocessed: 0,
            oldest: null,
            newest: null,
          },
          rateLimits: {
            activeLimits: 0,
            expiredLimits: 0,
          },
        },
      };
    }
  }
}

export const webhookMetricsService = new WebhookMetricsService();
