import type { APIRoute } from 'astro';
import { withTimeout } from '../../../lib/api-middleware';
import { deadLetterQueueHandler } from '../../../lib/integration/dead-letter-handler';

export const POST: APIRoute = withTimeout(async ({ request }) => {
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

  try {
    const body = (await request.json()) as { deadLetterId?: string };

    if (!body || !body.deadLetterId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required field: deadLetterId',
        }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    const { deadLetterId } = body;

    const success =
      await deadLetterQueueHandler.retryFailedDeadLetter(deadLetterId);

    return new Response(
      JSON.stringify({
        success: true,
        data: { deadLetterId, replayed: success },
        message: success
          ? 'Dead-letter webhook replayed successfully'
          : 'Failed to replay dead-letter webhook',
        timestamp: new Date().toISOString(),
      }),
      {
        status: success ? 200 : 500,
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[webhook/replay] Error replaying webhook', {
      error: error instanceof Error ? error.message : String(error),
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to replay webhook',
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}, 30000);
