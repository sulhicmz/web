import { createHmac } from 'crypto';

import type {
        CheckoutPayload,
        CheckoutSession,
        PaymentProvider,
        PaymentRecord,
        PaymentStatus,
        WebhookEvent,
        SubscriptionPayload,
        ProviderSubscription,
        CouponResult,
} from '../types';

interface MidtransOptions {
        serverKey: string;
        clientKey?: string;
        environment?: 'production' | 'sandbox';
}

const MIDTRANS_BASE = {
        production: {
                api: 'https://api.midtrans.com/v2',
                snap: 'https://app.midtrans.com/snap/v1',
        },
        sandbox: {
                api: 'https://api.sandbox.midtrans.com/v2',
                snap: 'https://app.sandbox.midtrans.com/snap/v1',
        },
} as const;

const DEFAULT_EXPIRY_MINUTES = 30;

const toAmount = (items: CheckoutPayload['items'], taxPercent?: number) => {
        const base = items.reduce((total, item) => total + item.price * item.quantity, 0);
        if (!taxPercent) return Math.round(base);
        return Math.round(base + base * (taxPercent / 100));
};

const mapStatus = (status: string): PaymentStatus => {
        switch (status) {
                case 'settlement':
                case 'capture':
                        return 'succeeded';
                case 'pending':
                        return 'pending';
                case 'challenge':
                        return 'waiting_for_capture';
                case 'cancel':
                        return 'canceled';
                case 'expire':
                        return 'failed';
                case 'refund':
                        return 'refunded';
                default:
                        return 'failed';
        }
};

export class MidtransProvider implements PaymentProvider {
        readonly name = 'midtrans';
        private readonly serverKey: string;
        private readonly environment: 'production' | 'sandbox';

        constructor(options: MidtransOptions) {
                if (!options.serverKey) {
                        throw new Error('Midtrans server key wajib diisi');
                }
                this.serverKey = options.serverKey;
                this.environment = options.environment ?? 'sandbox';
        }

        private get endpoints() {
                return MIDTRANS_BASE[this.environment];
        }

        private authorizationHeader() {
                const encoded = Buffer.from(`${this.serverKey}:`).toString('base64');
                return `Basic ${encoded}`;
        }

        async createCheckoutSession(payload: CheckoutPayload): Promise<CheckoutSession> {
                const orderReference = payload.reference ?? `order-${Date.now()}`;
                let grossAmount = toAmount(payload.items, payload.taxPercent);

                if (payload.couponCode) {
                        const coupon = await this.applyCoupon(orderReference, payload.couponCode);
                        if (coupon.valid) {
                                if (coupon.amountOff) {
                                        grossAmount -= coupon.amountOff;
                                        payload.items.push({
                                                id: 'DISCOUNT',
                                                name: `Coupon: ${payload.couponCode}`,
                                                price: -coupon.amountOff,
                                                quantity: 1,
                                        });
                                } else if (coupon.percentOff) {
                                        const discount = grossAmount * (coupon.percentOff / 100);
                                        grossAmount -= discount;
                                        payload.items.push({
                                                id: 'DISCOUNT',
                                                name: `Coupon: ${payload.couponCode}`,
                                                price: -discount,
                                                quantity: 1,
                                        });
                                }
                        }
                }

                const body = {
                        transaction_details: {
                                order_id: orderReference,
                                gross_amount: grossAmount,
                        },
                        item_details: payload.items.map((item) => ({
                                id: item.id,
                                name: item.name.substring(0, 50),
                                price: item.price,
                                quantity: item.quantity,
                                category: payload.mode,
                                merchant_name: 'Website Services',
                                url: payload.metadata?.productUrl,
                        })),
                        customer_details: {
                                first_name: payload.customer.name,
                                email: payload.customer.email,
                                phone: payload.customer.phone,
                        },
                        callbacks: {
                                finish: payload.successUrl,
                                error: payload.cancelUrl,
                                pending: payload.successUrl,
                        },
                        expiry: {
                                unit: 'minutes',
                                duration: DEFAULT_EXPIRY_MINUTES,
                        },
                        custom_field1: payload.metadata?.clientId ?? payload.customer.id,
                        custom_field2: payload.metadata?.projectId ?? payload.metadata?.subscriptionId,
                        custom_field3: payload.mode,
                        enabled_payments: payload.allowedChannels,
                };

                const response = await fetch(`${this.endpoints.snap}/transactions`, {
                        method: 'POST',
                        headers: {
                                'Content-Type': 'application/json',
                                Authorization: this.authorizationHeader(),
                                Accept: 'application/json',
                        },
                        body: JSON.stringify(body),
                });

                if (!response.ok) {
                        const detail = await response.text();
                        throw new Error(`Gagal membuat sesi pembayaran: ${response.status} ${detail}`);
                }

                const data = (await response.json()) as { token: string; redirect_url: string; expiry_time?: string };

                return {
                        id: data.token,
                        url: data.redirect_url,
                        reference: orderReference,
                        expiresAt: data.expiry_time ?? new Date(Date.now() + DEFAULT_EXPIRY_MINUTES * 60 * 1000).toISOString(),
                        providerPayload: data,
                };
        }

        async createSubscription(payload: SubscriptionPayload): Promise<ProviderSubscription> {
                // TODO: Fetch package details from the database
                let amount = 100000; // TODO: Get amount from package details

                if (payload.coupon) {
                        const coupon = await this.applyCoupon(payload.packageId, payload.coupon);
                        if (coupon.valid) {
                                if (coupon.amountOff) {
                                        amount -= coupon.amountOff;
                                } else if (coupon.percentOff) {
                                        amount -= amount * (coupon.percentOff / 100);
                                }
                        }
                }

                const body = {
                        name: payload.packageId,
                        amount,
                        currency: 'IDR',
                        payment_type: 'credit_card', // TODO: Get payment_type from payload
                        token: 'dummy_token', // TODO: Get token from customer
                        schedule: {
                                interval: 1,
                                interval_unit: 'month',
                                max_interval: 12,
                        },
                        customer_details: {
                                first_name: payload.customer.name,
                                email: payload.customer.email,
                                phone: payload.customer.phone,
                        },
                };

                const response = await fetch(`${this.endpoints.api}/subscriptions`, {
                        method: 'POST',
                        headers: {
                                'Content-Type': 'application/json',
                                Authorization: this.authorizationHeader(),
                                Accept: 'application/json',
                        },
                        body: JSON.stringify(body),
                });

                if (!response.ok) {
                        const detail = await response.text();
                        throw new Error(`Gagal membuat langganan: ${response.status} ${detail}`);
                }

                const data = (await response.json()) as { id: string; status: 'active' | 'inactive' | 'pending'; schedule: 'monthly' | 'yearly'; };

                return {
                        id: data.id,
                        status: data.status,
                        schedule: data.schedule,
                        providerPayload: data,
                };
        }

        async applyCoupon(reference: string, code: string): Promise<CouponResult> {
                // TODO: Implement this method
                // This method should fetch the coupon details from the database
                // and return the discount amount.
                // For now, we'll just return a dummy response.
                return {
                        code,
                        valid: true,
                        amountOff: 10000,
                        percentOff: 0,
                        message: 'Coupon applied successfully',
                };
        }

        verifyWebhook(payload: any, signature: string): boolean {
                const body = JSON.stringify(payload);
                const expectedSignature = createHmac('sha512', this.serverKey)
                        .update(body)
                        .digest('hex');

                if (signature !== expectedSignature) {
                        return false;
                }

                const transactionTime = new Date(payload.transaction_time);
                const now = new Date();
                const fiveMinutes = 5 * 60 * 1000;

                if (now.getTime() - transactionTime.getTime() > fiveMinutes) {
                        return false;
                }

                return true;
        }

        async getPaymentStatus(reference: string): Promise<PaymentRecord> {
                const response = await fetch(`${this.endpoints.api}/transactions/${reference}/status`, {
                        headers: {
                                Accept: 'application/json',
                                Authorization: this.authorizationHeader(),
                        },
                });

                if (!response.ok) {
                        const detail = await response.text();
                        throw new Error(`Tidak dapat mengambil status transaksi ${reference}: ${detail}`);
                }

                const data = (await response.json()) as Record<string, unknown> & {
                        transaction_status?: string;
                        gross_amount?: string;
                        currency?: string;
                };

                const amount = data.gross_amount ? Number.parseInt(String(data.gross_amount), 10) : 0;

                return {
                        reference,
                        status: mapStatus(String(data.transaction_status ?? 'failed')),
                        provider: this.name,
                        amount,
                        currency: String(data.currency ?? 'IDR'),
                        raw: data,
                };
        }

        async parseWebhook(body: string, headers: Record<string, string>): Promise<WebhookEvent> {
                const payload = JSON.parse(body) as Record<string, unknown> & {
                        order_id?: string;
                        transaction_status?: string;
                        signature_key?: string;
                        gross_amount?: string;
                };

                const reference = String(payload.order_id ?? '');
                if (!reference) {
                        throw new Error('Payload webhook tidak memiliki order_id');
                }

                const signatureHeader = headers['x-callback-token'] ?? headers['x-callback-signature'] ?? '';

                const signature = payload.signature_key ?? signatureHeader;
                const expectedSignature = createHmac('sha512', this.serverKey)
                        .update(`${reference}${payload.status_code ?? ''}${payload.gross_amount ?? ''}${this.serverKey}`)
                        .digest('hex');

                const signatureValid = signature === expectedSignature;
                const status = mapStatus(String(payload.transaction_status ?? 'failed'));

                return {
                        reference,
                        status,
                        raw: payload,
                        signatureValid,
                        type: 'payment',
                };
        }
}
