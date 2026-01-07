import type { APIRoute } from 'astro';

import {
        assertPaymentProvider,
        sanitizeCheckoutPayload,
        type CheckoutPayload,
} from '../../../lib/payments';

const json = (data: unknown, init: ResponseInit = {}) =>
        new Response(JSON.stringify(data), {
                status: init.status ?? 200,
                headers: {
                        'content-type': 'application/json; charset=utf-8',
                        'cache-control': 'no-store',
                        ...init.headers,
                },
        });

const isCheckoutPayload = (payload: unknown): payload is CheckoutPayload => {
        if (!payload || typeof payload !== 'object') return false;
        const data = payload as Record<string, unknown>;
        const items = Array.isArray(data.items) ? data.items : [];
        const customer = data.customer as Record<string, unknown> | undefined;

        return (
                items.length > 0 &&
                items.every(
                        (item) =>
                                item &&
                                typeof item === 'object' &&
                                typeof (item as Record<string, unknown>).id === 'string' &&
                                typeof (item as Record<string, unknown>).name === 'string' &&
                                typeof (item as Record<string, unknown>).quantity === 'number' &&
                                typeof (item as Record<string, unknown>).price === 'number',
                ) &&
                customer !== undefined &&
                typeof customer.id === 'string' &&
                typeof customer.name === 'string' &&
                typeof data.successUrl === 'string' &&
                typeof data.cancelUrl === 'string'
        );
};

export const POST: APIRoute = async ({ request }) => {
        let rawPayload: unknown;
        try {
                rawPayload = await request.json();
        } catch {
                return json({ error: 'Body harus berupa JSON valid.' }, { status: 400 });
        }

        if (!isCheckoutPayload(rawPayload)) {
                return json({ error: 'Payload checkout tidak valid.' }, { status: 422 });
        }

        const provider = (() => {
                try {
                        return assertPaymentProvider();
                } catch {
                        return null;
                }
        })();

        if (!provider) {
                return json({ error: 'Provider pembayaran belum dikonfigurasi.' }, { status: 503 });
        }

        try {
                const payload = sanitizeCheckoutPayload(rawPayload);
                if (payload.couponCode && provider.applyCoupon) {
                        await provider.applyCoupon(payload.reference!, payload.couponCode);
                }

                const session = await provider.createCheckoutSession(payload);
                return json({ session }, {
                        headers: {
                                'idempotency-key': request.headers.get('idempotency-key') ?? '',
                        },
                });
        } catch (error) {
                console.error('[payments/session]', error);
                return json({ error: 'Gagal membuat sesi pembayaran.' }, { status: 500 });
        }
};
