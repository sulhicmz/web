import type { APIRoute } from 'astro';
import { withTimeout } from '../../../lib/api-middleware';
import { ApiError } from '../../../lib/api-utils';
import { getServiceClient } from '../../../lib/supabase/server';
import { MidtransProvider } from '../../../lib/payments/providers/midtrans';
import { createRepositories } from '../../../lib/repositories/factory';
import type { ICouponRepository, IPackageRepository, IAddonRepository } from '../../../lib/repositories';
import { webhookDeduplicationService } from '../../../lib/integration/webhook-deduplication';

export const POST: APIRoute = withTimeout(async ({ request }) => {
  const serverKey = import.meta.env.MIDTRANS_SERVER_KEY;
  const environment = (import.meta.env.PAYMENT_ENV as 'sandbox' | 'production') || 'sandbox';

  if (!serverKey) {
    console.warn('[payments/webhook] MIDTRANS_SERVER_KEY not configured');
    throw new ApiError('Payment provider not configured', 500, 'PROVIDER_NOT_CONFIGURED');
  }

  let couponRepository: ICouponRepository | null = null;
  let packageRepository: IPackageRepository | null = null;
  let addonRepository: IAddonRepository | null = null;

  try {
    const supabaseClient = getServiceClient();
    const repositories = createRepositories(supabaseClient);
    couponRepository = repositories.couponRepository;
    packageRepository = repositories.packageRepository;
    addonRepository = repositories.addonRepository;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Supabase service client unavailable';
    console.warn('[payments/webhook] Supabase service client unavailable', message);
  }

  const provider = new MidtransProvider({
    serverKey,
    environment,
    couponRepository: couponRepository!,
    packageRepository: packageRepository!,
    addonRepository: addonRepository!,
  });

        const body = await request.json();
        const signature = request.headers.get('x-callback-token') ?? request.headers.get('x-callback-signature') ?? '';

        if (!(await provider.verifyWebhook(body, signature))) {
                console.warn('[payments/webhook] Invalid signature');
                throw new ApiError('Invalid webhook signature', 400, 'INVALID_SIGNATURE');
        }

        const event = await provider.parseWebhook(JSON.stringify(body), Object.fromEntries(request.headers.entries()));

        const orderId = event.reference;
        const webhookId = `${orderId}-${Date.now()}`;

        const { isDuplicate } = await webhookDeduplicationService.checkAndMarkProcessed(
                webhookId,
                signature,
                orderId,
                'midtrans'
        );

        if (isDuplicate) {
                console.info('[payments/webhook] Duplicate webhook skipped', { webhookId, orderId });
                return new Response(JSON.stringify({
                        success: true,
                        data: { received: true, duplicate: true, event: { reference: event.reference, status: event.status } },
                        timestamp: new Date().toISOString(),
                }), {
                        status: 200,
                        headers: {
                                'content-type': 'application/json; charset=utf-8',
                        },
                });
        }

        try {
                console.info('[payments/webhook] Processing webhook', { webhookId, orderId, status: event.status });
        } catch (error) {
                console.error('[payments/webhook] Error processing webhook', {
                        webhookId,
                        orderId,
                        error: error instanceof Error ? error.message : String(error),
                });

                await webhookDeduplicationService.enqueueRetry(
                        webhookId,
                        orderId,
                        body as Record<string, unknown>,
                        signature,
                        Object.fromEntries(request.headers.entries()),
                        0,
                        5,
                        error instanceof Error ? error.message : String(error)
                );

                return new Response(JSON.stringify({
                        success: false,
                        data: { received: true, queued: true, event: { reference: event.reference, status: event.status } },
                        timestamp: new Date().toISOString(),
                }), {
                        status: 202,
                        headers: {
                                'content-type': 'application/json; charset=utf-8',
                        },
                });
        }

        return new Response(JSON.stringify({
                success: true,
                data: { received: true, processed: true, event: { reference: event.reference, status: event.status } },
                timestamp: new Date().toISOString(),
        }), {
                status: 200,
                headers: {
                        'content-type': 'application/json; charset=utf-8',
                },
        });
}, 10000);
