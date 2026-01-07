import type { APIRoute } from 'astro';
import { withTimeout } from '../../../lib/api-middleware';
import { ApiError } from '../../../lib/api-utils';
import { MidtransProvider } from '../../../lib/payments/providers/midtrans';

export const POST: APIRoute = withTimeout(async ({ request }) => {
        const serverKey = import.meta.env.MIDTRANS_SERVER_KEY || '';
        const environment = (import.meta.env.PAYMENT_ENV as 'sandbox' | 'production') || 'sandbox';

        const provider = new MidtransProvider({
                serverKey,
                environment,
        });

        const body = await request.json();
        const signature = request.headers.get('x-callback-token') ?? request.headers.get('x-callback-signature') ?? '';

        if (!(await provider.verifyWebhook(body, signature))) {
                console.warn('[payments/webhook] Invalid signature');
                throw new ApiError('Invalid webhook signature', 400, 'INVALID_SIGNATURE');
        }

        const event = await provider.parseWebhook(JSON.stringify(body), Object.fromEntries(request.headers.entries()));

        return new Response(JSON.stringify({
                success: true,
                data: { received: true, event: { reference: event.reference, status: event.status } },
                timestamp: new Date().toISOString(),
        }), {
                status: 200,
                headers: {
                        'content-type': 'application/json; charset=utf-8',
                },
        });
}, 10000);
