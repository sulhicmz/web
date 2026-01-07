import type { APIRoute } from 'astro';
import { withTimeout } from '../../../lib/api-middleware';
import { MidtransProvider } from '../../../lib/payments/providers/midtrans';

const json = (data: unknown, init: ResponseInit = {}) =>
        new Response(JSON.stringify(data), {
                status: init.status ?? 200,
                headers: {
                        'content-type': 'application/json; charset=utf-8',
                        ...init.headers,
                },
        });

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
                return json({ error: 'Signature webhook tidak valid.' }, { status: 400 });
        }

        const event = await provider.parseWebhook(JSON.stringify(body), Object.fromEntries(request.headers.entries()));

        return json({ received: true, event: { reference: event.reference, status: event.status } });
}, 10000);
