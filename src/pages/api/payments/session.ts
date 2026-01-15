import type { APIRoute } from 'astro';
import { withRateLimit, withTimeout } from '../../../lib/api-middleware';
import { ApiError } from '../../../lib/api-utils';

import {
        assertPaymentProvider,
        sanitizeCheckoutPayload,
        type CheckoutPayload,
} from '../../../lib/payments';

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

export const POST: APIRoute = withRateLimit(
        withTimeout(async ({ request }) => {
                let rawPayload: unknown;
                try {
                        rawPayload = await request.json();
                } catch {
                        throw new ApiError('Request body must be valid JSON', 400, 'INVALID_JSON');
                }

                if (!isCheckoutPayload(rawPayload)) {
                        throw new ApiError('Invalid checkout payload', 422, 'INVALID_PAYLOAD');
                }

                const provider = (() => {
                        try {
                                return assertPaymentProvider();
                        } catch {
                                return null;
                        }
                })();

                if (!provider) {
                        throw new ApiError('Payment provider not configured', 503, 'PROVIDER_NOT_CONFIGURED');
                }

                try {
                        const payload = sanitizeCheckoutPayload(rawPayload);
                        if (payload.couponCode && provider.applyCoupon) {
                                await provider.applyCoupon(payload.reference!, payload.couponCode);
                        }

                        const session = await provider.createCheckoutSession(payload);
                        return new Response(JSON.stringify({
                                success: true,
                                data: { session },
                                timestamp: new Date().toISOString(),
                        }), {
                                status: 200,
                                headers: {
                                        'content-type': 'application/json; charset=utf-8',
                                        'cache-control': 'no-store',
                                        'idempotency-key': request.headers.get('idempotency-key') ?? '',
                                },
                        });
                } catch (error) {
                        console.error('[payments/session]', error);
                        throw new ApiError('Failed to create payment session', 500, 'SESSION_CREATION_FAILED');
                }
        }, 20000),
        60 * 1000,
        10
);
