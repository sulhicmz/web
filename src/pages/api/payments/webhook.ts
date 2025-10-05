import type { APIRoute } from 'astro';

import { assertPaymentProvider } from '../../../lib/payments';

const json = (data: unknown, init: ResponseInit = {}) =>
        new Response(JSON.stringify(data), {
                status: init.status ?? 200,
                headers: {
                        'content-type': 'application/json; charset=utf-8',
                        ...init.headers,
                },
        });

export const post: APIRoute = async ({ request }) => {
        let provider;
        try {
                provider = assertPaymentProvider();
        } catch (error) {
                return json({ error: 'Provider pembayaran belum dikonfigurasi.' }, { status: 503 });
        }

        const body = await request.text();
        const headers = Object.fromEntries(request.headers.entries());

        try {
                const event = await provider.parseWebhook(body, headers);
                return json({ received: true, event: { reference: event.reference, status: event.status, signatureValid: event.signatureValid } });
        } catch (error) {
                console.error('[payments/webhook]', error);
                return json({ error: 'Payload webhook tidak valid.' }, { status: 400 });
        }
};
