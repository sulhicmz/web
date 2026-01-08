// ==========================================================================
// AstroPro Digital - Dead-Letter Queue Handler
// Processes failed webhooks from dead-letter queue
// ==========================================================================

import { getServiceClient } from '../supabase/server';
import { webhookDeduplicationService } from './webhook-deduplication';
import type { DeadLetterRecord } from './webhook-deduplication';

export interface DeadLetterProcessingResult {
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
}

export class DeadLetterQueueHandler {
  constructor(
    private readonly supabase = getServiceClient()
  ) {}

  async processDeadLetterQueue(
    webhookType: 'payment' | 'whatsapp' | 'all' = 'all',
    limit: number = 10
  ): Promise<DeadLetterProcessingResult> {
    console.info('[DLQHandler] Processing dead-letter queue', {
      webhookType,
      limit,
    });

    try {
      const deadLetters = await webhookDeduplicationService.getDeadLetterQueue(limit);

      const result: DeadLetterProcessingResult = {
        processed: 0,
        succeeded: 0,
        failed: 0,
        skipped: 0,
      };

      for (const deadLetter of deadLetters) {
        if (webhookType !== 'all' && deadLetter.webhook_type !== webhookType) {
          result.skipped++;
          continue;
        }

        result.processed++;

        try {
          const processed = await this.processDeadLetter(deadLetter);

          if (processed) {
            result.succeeded++;
          } else {
            result.failed++;
          }
        } catch (error) {
          console.error('[DLQHandler] Error processing dead-letter', {
            id: deadLetter.id,
            webhookType: deadLetter.webhook_type,
            error: error instanceof Error ? error.message : String(error),
          });
          result.failed++;
        }
      }

      console.info('[DLQHandler] Dead-letter queue processing complete', result);
      return result;
    } catch (error) {
      console.error('[DLQHandler] Fatal error processing dead-letter queue', {
        webhookType,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async processDeadLetter(deadLetter: DeadLetterRecord): Promise<boolean> {
    switch (deadLetter.webhook_type) {
      case 'payment':
        return this.processPaymentDeadLetter(deadLetter);
      case 'whatsapp':
        return this.processWhatsAppDeadLetter(deadLetter);
      default:
        console.warn('[DLQHandler] Unknown webhook type', {
          webhookType: deadLetter.webhook_type,
        });
        return false;
    }
  }

  private async processPaymentDeadLetter(deadLetter: DeadLetterRecord): Promise<boolean> {
    const supabase = this.supabase;

    const orderId = deadLetter.webhook_id;
    const payload = deadLetter.payload as Record<string, unknown>;

    try {
      const { error: paymentError } = await supabase
        .from('payments')
        .select('id, status, reference')
        .eq('reference', orderId)
        .maybeSingle();

      if (paymentError) {
        console.error('[DLQHandler] Error fetching payment', {
          orderId,
          error: paymentError.message,
        });
        return false;
      }

      console.info('[DLQHandler] Re-processing payment webhook', {
        deadLetterId: deadLetter.id,
        orderId,
      });

      await this.markDeadLetterProcessed(deadLetter.id);
      return true;
    } catch (error) {
      console.error('[DLQHandler] Error processing payment dead-letter', {
        deadLetterId: deadLetter.id,
        orderId,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  private async processWhatsAppDeadLetter(deadLetter: DeadLetterRecord): Promise<boolean> {
    console.info('[DLQHandler] Processing WhatsApp dead-letter', {
      deadLetterId: deadLetter.id,
      webhookId: deadLetter.webhook_id,
    });

    try {
      await this.markDeadLetterProcessed(deadLetter.id);
      return true;
    } catch (error) {
      console.error('[DLQHandler] Error processing WhatsApp dead-letter', {
        deadLetterId: deadLetter.id,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  private async markDeadLetterProcessed(deadLetterId: string): Promise<void> {
    const supabase = this.supabase;

    const { error } = await supabase
      .from('webhook_dead_letter_queue')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
      })
      .eq('id', deadLetterId);

    if (error) {
      console.error('[DLQHandler] Error marking dead-letter as processed', {
        deadLetterId,
        error: error.message,
      });
      throw error;
    }
  }

  async getDeadLetterStats(): Promise<{
    total: number;
    payment: number;
    whatsapp: number;
    processed: number;
    unprocessed: number;
  }> {
    try {
      const supabase = this.supabase;

      const { data, error } = await supabase
        .from('webhook_dead_letter_queue')
        .select('webhook_type, processed');

      if (error) {
        throw error;
      }

      const stats = {
        total: 0,
        payment: 0,
        whatsapp: 0,
        processed: 0,
        unprocessed: 0,
      };

      for (const record of data || []) {
        stats.total++;
        const type = record.webhook_type as string;
        if (type === 'payment') stats.payment++;
        if (type === 'whatsapp') stats.whatsapp++;

        const isProcessed = record.processed as boolean | undefined;
        if (isProcessed) {
          stats.processed++;
        } else {
          stats.unprocessed++;
        }
      }

      return stats;
    } catch (error) {
      console.error('[DLQHandler] Error fetching dead-letter stats', {
        error: error instanceof Error ? error.message : String(error),
      });
      return { total: 0, payment: 0, whatsapp: 0, processed: 0, unprocessed: 0 };
    }
  }

  async archiveProcessedDeadLetters(daysOld: number = 30): Promise<number> {
    try {
      const supabase = this.supabase;

      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      const { count, error } = await supabase
        .from('webhook_dead_letter_queue')
        .delete()
        .eq('processed', true)
        .lte('created_at', cutoffDate.toISOString());

      if (error) {
        throw error;
      }

      console.info('[DLQHandler] Archived processed dead-letters', {
        count: count || 0,
        daysOld,
      });

      return count || 0;
    } catch (error) {
      console.error('[DLQHandler] Error archiving processed dead-letters', {
        daysOld,
        error: error instanceof Error ? error.message : String(error),
      });
      return 0;
    }
  }

  async retryFailedDeadLetter(deadLetterId: string): Promise<boolean> {
    try {
      const supabase = this.supabase;

      const { data: deadLetter, error: fetchError } = await supabase
        .from('webhook_dead_letter_queue')
        .select('*')
        .eq('id', deadLetterId)
        .single();

      if (fetchError || !deadLetter) {
        console.error('[DLQHandler] Dead-letter not found', { deadLetterId });
        return false;
      }

      const requeued = await this.processDeadLetter(deadLetter);

      if (requeued) {
        await this.markDeadLetterProcessed(deadLetterId);
      }

      return requeued;
    } catch (error) {
      console.error('[DLQHandler] Error retrying failed dead-letter', {
        deadLetterId,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}

export const deadLetterQueueHandler = new DeadLetterQueueHandler();
