import type { APIRoute } from 'astro';
import { withTimeout } from '../../../lib/api-middleware';
import { webhookDeduplicationService } from '../../../lib/integration/webhook-deduplication';
import { deadLetterQueueHandler } from '../../../lib/integration/dead-letter-handler';
import { webhookMetricsService } from '../../../lib/integration/webhook-metrics';

export const GET: APIRoute = withTimeout(async ({ request, url }) => {
  const authHeader = request.headers.get('authorization');
  const adminToken = import.meta.env.ADMIN_API_TOKEN;

  if (!adminToken) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Admin API not configured',
      }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }

  if (authHeader !== `Bearer ${adminToken}`) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unauthorized',
      }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  const searchParams = new URL(request.url).searchParams;
  const metricType = searchParams.get('type') || 'summary';
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

  try {
    switch (metricType) {
      case 'summary':
        const summaryMetrics = await webhookMetricsService.getMetrics();
        return new Response(
          JSON.stringify({
            success: true,
            data: summaryMetrics,
            timestamp: new Date().toISOString(),
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );

      case 'health':
        const healthStatus = await webhookMetricsService.getHealthStatus();
        return new Response(
          JSON.stringify({
            success: true,
            data: healthStatus,
            timestamp: new Date().toISOString(),
          }),
          {
            status: healthStatus.status === 'healthy' ? 200 : 503,
            headers: { 'content-type': 'application/json' },
          }
        );

      case 'retry-queue':
        const retryQueue =
          await webhookMetricsService.getDetailedRetryQueue(limit || 20);
        return new Response(
          JSON.stringify({
            success: true,
            data: retryQueue,
            count: retryQueue.length,
            timestamp: new Date().toISOString(),
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );

      case 'dead-letter':
        const deadLetterQueue =
          await webhookDeduplicationService.getDeadLetterQueue(limit || 50);
        return new Response(
          JSON.stringify({
            success: true,
            data: deadLetterQueue,
            count: deadLetterQueue.length,
            timestamp: new Date().toISOString(),
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );

      case 'dead-letter-stats':
        const dlqStats = await deadLetterQueueHandler.getDeadLetterStats();
        return new Response(
          JSON.stringify({
            success: true,
            data: dlqStats,
            timestamp: new Date().toISOString(),
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );

      case 'cleanup':
        const cleanupResult =
          await webhookDeduplicationService.cleanupOldRecords();
        return new Response(
          JSON.stringify({
            success: true,
            data: cleanupResult,
            message: `Cleaned up ${cleanupResult.dedup} dedup records, ${cleanupResult.retry} retry records, ${cleanupResult.deadLetter} dead-letter records`,
            timestamp: new Date().toISOString(),
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid metric type',
            availableTypes: [
              'summary',
              'health',
              'retry-queue',
              'dead-letter',
              'dead-letter-stats',
              'cleanup',
            ],
          }),
          { status: 400, headers: { 'content-type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('[webhook/metrics] Error fetching metrics', {
      metricType,
      error: error instanceof Error ? error.message : String(error),
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch metrics',
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}, 30000);
