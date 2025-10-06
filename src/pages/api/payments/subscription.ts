import type { APIRoute } from 'astro';

import {
        assertPaymentProvider,
        type SubscriptionPayload,
        type SubscriptionPaymentMethod,
        type SubscriptionSchedule,
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

const isSubscriptionPayment = (value: unknown): value is SubscriptionPaymentMethod => {
        if (!value || typeof value !== 'object') return false;
        const payment = value as Record<string, unknown>;
        return typeof payment.type === 'string' && typeof payment.token === 'string' && payment.token.length > 10;
};

const isSubscriptionSchedule = (value: unknown): value is SubscriptionSchedule => {
        if (!value || typeof value !== 'object') return false;
        const schedule = value as Record<string, unknown>;
        const interval = Number(schedule.interval);
        const intervalUnit = schedule.intervalUnit;
        if (!Number.isFinite(interval) || interval <= 0) return false;
        if (intervalUnit !== 'day' && intervalUnit !== 'week' && intervalUnit !== 'month' && intervalUnit !== 'year') {
                return false;
        }
        if (schedule.maxInterval !== undefined) {
                const maxInterval = Number(schedule.maxInterval);
                if (!Number.isFinite(maxInterval) || maxInterval <= 0) {
                        return false;
                }
        }
        if (schedule.startAt !== undefined) {
                const startAt = new Date(String(schedule.startAt));
                if (Number.isNaN(startAt.getTime())) {
                        return false;
                }
        }
        return true;
};

const isSubscriptionPayload = (value: unknown): value is SubscriptionPayload => {
        if (!value || typeof value !== 'object') return false;
        const payload = value as Record<string, unknown>;

        const packageId = payload.packageId;
        if (typeof packageId !== 'string' || packageId.trim() === '') {
                return false;
        }

        const addons = payload.addons;
        if (!Array.isArray(addons) || !addons.every((id) => typeof id === 'string')) {
                return false;
        }

        const customer = payload.customer as Record<string, unknown> | undefined;
        if (!customer || typeof customer.id !== 'string' || typeof customer.name !== 'string') {
                return false;
        }
        if (customer.email !== undefined && typeof customer.email !== 'string') {
                return false;
        }
        if (customer.phone !== undefined && typeof customer.phone !== 'string') {
                return false;
        }

        if (!isSubscriptionPayment(payload.payment)) {
                return false;
        }

        if (payload.schedule !== undefined && !isSubscriptionSchedule(payload.schedule)) {
                return false;
        }

        if (payload.coupon !== undefined && typeof payload.coupon !== 'string') {
                return false;
        }

        if (payload.metadata !== undefined && typeof payload.metadata !== 'object') {
                return false;
        }

        return true;
};

export const POST: APIRoute = async ({ request }) => {
        let rawPayload: unknown;
        try {
                rawPayload = await request.json();
        } catch (error) {
                return json({ error: 'Body harus berupa JSON valid.' }, { status: 400 });
        }

        if (!isSubscriptionPayload(rawPayload)) {
                return json({ error: 'Payload langganan tidak valid.' }, { status: 422 });
        }

        const provider = (() => {
                try {
                        return assertPaymentProvider();
                } catch (error) {
                        return null;
                }
        })();

        if (!provider) {
                return json({ error: 'Provider pembayaran belum dikonfigurasi.' }, { status: 503 });
        }

        try {
                const subscription = await provider.createSubscription(rawPayload);
                return json({ subscription });
        } catch (error) {
                const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat langganan.';
                console.error('[payments/subscription]', error);
                return json({ error: message }, { status: 500 });
        }
};
