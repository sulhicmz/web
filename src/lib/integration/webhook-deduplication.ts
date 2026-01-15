// ==========================================================================
// AstroPro Digital - Webhook Deduplication Service
// Prevents duplicate webhook processing with at-least-once semantics
// ==========================================================================

import { getServiceClient } from '../supabase/server';

export interface WebhookDedupRecord {
  id: string;
  webhook_id: string;
  provider: string;
  signature: string;
  order_id: string | null;
  processed_at: string;
  created_at: string;
}

export interface WebhookRetryQueueRecord {
  id: string;
  webhook_id: string;
  order_id: string;
  payload: Record<string, unknown>;
  signature: string;
  headers: Record<string, unknown> | null;
  attempt: number;
  max_attempts: number;
  status: string;
  error_message: string | null;
  retry_after: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeadLetterRecord {
  id: string;
  webhook_type: string;
  webhook_id: string;
  payload: Record<string, unknown>;
  headers: Record<string, unknown> | null;
  error_message: string | null;
  attempt: number;
  created_at: string;
}

export class WebhookDeduplicationService {
  private readonly cleanupAfterDays = 7;
  private readonly retentionDays = 30;

  constructor(
    private readonly supabase = getServiceClient()
  ) {}

  async checkAndMarkProcessed(
    webhookId: string,
    signature: string,
    orderId?: string,
    provider: string = 'midtrans'
  ): Promise<{ isDuplicate: boolean; existing?: WebhookDedupRecord }> {
    try {
      const supabase = this.supabase;

      const { data: existing, error: checkError } = await supabase
        .from('payment_webhook_dedup')
        .select('*')
        .eq('webhook_id', webhookId)
        .eq('signature', signature)
        .maybeSingle();

      if (checkError) {
        console.error('[WebhookDedup] Error checking dedup record', {
          webhookId,
          error: checkError.message,
        });
        throw checkError;
      }

      if (existing) {
        console.info('[WebhookDedup] Duplicate webhook detected', {
          webhookId,
          orderId,
          processedAt: existing.processed_at,
        });
        return { isDuplicate: true, existing };
      }

      const { data: record, error: insertError } = await supabase
        .from('payment_webhook_dedup')
        .insert({
          webhook_id: webhookId,
          provider,
          signature,
          order_id: orderId || null,
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          console.info('[WebhookDedup] Race condition - webhook already processed', {
            webhookId,
          });
          const { data: raceExisting } = await supabase
            .from('payment_webhook_dedup')
            .select('*')
            .eq('webhook_id', webhookId)
            .eq('signature', signature)
            .single();
          return { isDuplicate: true, existing: raceExisting || undefined };
        }
        throw insertError;
      }

      console.info('[WebhookDedup] Webhook marked as processed', {
        webhookId,
        orderId,
      });

      return { isDuplicate: false, existing: record as WebhookDedupRecord };
    } catch (error) {
      console.error('[WebhookDedup] Fatal error in checkAndMarkProcessed', {
        webhookId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async enqueueRetry(
    webhookId: string,
    orderId: string,
    payload: Record<string, unknown>,
    signature: string,
    headers: Record<string, string>,
    attempt: number = 0,
    maxAttempts: number = 5,
    errorMessage?: string
  ): Promise<void> {
    try {
      const supabase = this.supabase;

      const retryAfterMinutes = [5, 15, 60, 120, 240][attempt] || 240;
      const retryAfter = new Date(Date.now() + retryAfterMinutes * 60 * 1000);

      const { error } = await supabase
        .from('payment_webhook_retry_queue')
        .insert({
          webhook_id: webhookId,
          order_id: orderId,
          payload,
          signature,
          headers: headers as Record<string, unknown>,
          attempt,
          max_attempts: maxAttempts,
          status: 'pending',
          error_message: errorMessage || null,
          retry_after: retryAfter.toISOString(),
        });

      if (error) {
        throw error;
      }

      console.info('[WebhookDedup] Webhook enqueued for retry', {
        webhookId,
        orderId,
        attempt,
        retryAfter,
      });
    } catch (error) {
      console.error('[WebhookDedup] Error enqueuing webhook retry', {
        webhookId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getRetryableWebhooks(limit: number = 10): Promise<WebhookRetryQueueRecord[]> {
    try {
      const supabase = this.supabase;

      const { data, error } = await supabase
        .from('payment_webhook_retry_queue')
        .select('*')
        .eq('status', 'pending')
        .lte('retry_after', new Date().toISOString())
        .order('retry_after', { ascending: true })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data || []) as WebhookRetryQueueRecord[];
    } catch (error) {
      console.error('[WebhookDedup] Error fetching retryable webhooks', {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  async updateRetryStatus(
    id: string,
    status: 'pending' | 'processing' | 'succeeded' | 'failed',
    errorMessage?: string,
    attempt?: number
  ): Promise<void> {
    try {
      const supabase = this.supabase;

      const updates: Record<string, unknown> = { status };

      if (errorMessage !== undefined) {
        updates.error_message = errorMessage;
      }

      if (attempt !== undefined) {
        updates.attempt = attempt;
      }

      const { error } = await supabase
        .from('payment_webhook_retry_queue')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('[WebhookDedup] Error updating retry status', {
        id,
        status,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async moveToDeadLetter(record: WebhookRetryQueueRecord): Promise<void> {
    try {
      const supabase = this.supabase;

      const { error: insertError } = await supabase
        .from('webhook_dead_letter_queue')
        .insert({
          webhook_type: 'payment',
          webhook_id: record.webhook_id,
          payload: record.payload,
          headers: record.headers,
          error_message: record.error_message,
          attempt: record.attempt,
        });

      if (insertError) {
        throw insertError;
      }

      const { error: deleteError } = await supabase
        .from('payment_webhook_retry_queue')
        .delete()
        .eq('id', record.id);

      if (deleteError) {
        throw deleteError;
      }

      console.warn('[WebhookDedup] Webhook moved to dead-letter queue', {
        webhookId: record.webhook_id,
        orderId: record.order_id,
        attempts: record.attempt,
      });
    } catch (error) {
      console.error('[WebhookDedup] Error moving webhook to dead-letter queue', {
        webhookId: record.webhook_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async removeRetryRecord(id: string): Promise<void> {
    try {
      const supabase = this.supabase;

      const { error } = await supabase
        .from('payment_webhook_retry_queue')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('[WebhookDedup] Error removing retry record', {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async cleanupOldRecords(): Promise<{ dedup: number; retry: number; deadLetter: number }> {
    try {
      const supabase = this.supabase;

      const retentionDate = new Date(Date.now() - this.cleanupAfterDays * 24 * 60 * 60 * 1000);

      const [
        { count: dedupCount },
        { count: retryCount },
        { count: deadLetterCount },
      ] = await Promise.all([
        supabase
          .from('payment_webhook_dedup')
          .delete()
          .lte('processed_at', retentionDate.toISOString()),
        supabase
          .from('payment_webhook_retry_queue')
          .delete()
          .eq('status', 'succeeded')
          .lte('updated_at', retentionDate.toISOString()),
        supabase
          .from('webhook_dead_letter_queue')
          .delete()
          .lte('created_at', retentionDate.toISOString()),
      ]);

      console.info('[WebhookDedup] Cleanup completed', {
        dedup: dedupCount || 0,
        retry: retryCount || 0,
        deadLetter: deadLetterCount || 0,
      });

      return {
        dedup: dedupCount || 0,
        retry: retryCount || 0,
        deadLetter: deadLetterCount || 0,
      };
    } catch (error) {
      console.error('[WebhookDedup] Error during cleanup', {
        error: error instanceof Error ? error.message : String(error),
      });
      return { dedup: 0, retry: 0, deadLetter: 0 };
    }
  }

  async getDeadLetterQueue(limit: number = 50): Promise<DeadLetterRecord[]> {
    try {
      const supabase = this.supabase;

      const { data, error } = await supabase
        .from('webhook_dead_letter_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data || []) as DeadLetterRecord[];
    } catch (error) {
      console.error('[WebhookDedup] Error fetching dead-letter queue', {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  async getRetryStats(): Promise<{
    pending: number;
    processing: number;
    succeeded: number;
    failed: number;
  }> {
    try {
      const supabase = this.supabase;

      const { data, error } = await supabase
        .from('payment_webhook_retry_queue')
        .select('status')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const stats = {
        pending: 0,
        processing: 0,
        succeeded: 0,
        failed: 0,
      };

      for (const record of data || []) {
        const status = record.status as string;
        if (status in stats) {
          stats[status as keyof typeof stats]++;
        }
      }

      return stats;
    } catch (error) {
      console.error('[WebhookDedup] Error fetching retry stats', {
        error: error instanceof Error ? error.message : String(error),
      });
      return { pending: 0, processing: 0, succeeded: 0, failed: 0 };
    }
  }
}

export const webhookDeduplicationService = new WebhookDeduplicationService();
