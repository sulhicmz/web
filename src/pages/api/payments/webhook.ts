import type { APIRoute } from 'astro';
import { MidtransProvider } from '../../../lib/payments/providers/midtrans';

const json = (data: unknown, init: ResponseInit = {}) =>
        new Response(JSON.stringify(data), {
                status: init.status ?? 200,
                headers: {
                        'content-type': 'application/json; charset=utf-8',
                        ...init.headers,
                },
        });

export const post: APIRoute = async ({ request }) => {
        const provider = new MidtransProvider({
                serverKey: import.meta.env.MIDTRANS_SERVER_KEY,
                environment: import.meta.env.PAYMENT_ENV as 'sandbox' | 'production',
        });

        const body = await request.json();
        const signature = request.headers.get('x-callback-token') ?? request.headers.get('x-callback-signature') ?? '';

        if (!provider.verifyWebhook(body, signature)) {
                console.warn('[payments/webhook] Invalid signature');
                return json({ error: 'Signature webhook tidak valid.' }, { status: 400 });
        }

        const event = await provider.parseWebhook(JSON.stringify(body), Object.fromEntries(request.headers.entries()));

        return json({ received: true, event: { reference: event.reference, status: event.status } });
};
