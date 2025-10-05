export type PaymentMode = 'one_time' | 'subscription';

export interface CheckoutItem {
        id: string;
        name: string;
        quantity: number;
        price: number;
        description?: string;
}

export interface CustomerInfo {
        id: string;
        name: string;
        email?: string;
        phone?: string;
}

export interface SubscriptionOptions {
        interval: 'monthly' | 'quarterly' | 'yearly';
        trialDays?: number;
        startAt?: string;
}

export interface CheckoutPayload {
        mode: PaymentMode;
        items: CheckoutItem[];
        customer: CustomerInfo;
        successUrl: string;
        cancelUrl: string;
        reference?: string;
        allowedChannels?: string[];
        metadata?: Record<string, unknown>;
        subscription?: SubscriptionOptions;
        couponCode?: string;
        taxPercent?: number;
}

export interface CheckoutSession {
        id: string;
        url: string;
        reference: string;
        expiresAt?: string;
        providerPayload?: Record<string, unknown>;
}

export type PaymentStatus =
        | 'pending'
        | 'waiting_for_capture'
        | 'succeeded'
        | 'canceled'
        | 'refunded'
        | 'failed';

export interface PaymentRecord {
        reference: string;
        status: PaymentStatus;
        provider: string;
        amount: number;
        currency: string;
        raw: Record<string, unknown>;
}

export interface CouponResult {
        code: string;
        valid: boolean;
        amountOff?: number;
        percentOff?: number;
        message?: string;
}

export interface WebhookEvent {
        reference: string;
        status: PaymentStatus;
        raw: Record<string, unknown>;
        signatureValid: boolean;
        type: 'payment' | 'refund' | 'unknown';
}

export interface PaymentProvider {
        readonly name: string;
        createCheckoutSession(payload: CheckoutPayload): Promise<CheckoutSession>;
        getPaymentStatus(reference: string): Promise<PaymentRecord>;
        applyCoupon?(reference: string, code: string): Promise<CouponResult>;
        parseWebhook(body: string, headers: Record<string, string>): Promise<WebhookEvent>;
}
