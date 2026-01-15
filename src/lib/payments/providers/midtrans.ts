import type { ICouponRepository, IPackageRepository, IAddonRepository } from '../../repositories';
import type { Coupon } from '../../repositories/coupon.repository';
import { ResilientHttpClient } from '../../integration/http-client';

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
  couponRepository?: ICouponRepository;
  packageRepository?: IPackageRepository;
  addonRepository?: IAddonRepository;
}

interface MidtransWebhookPayload {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  transaction_time?: string;
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

type PackageRow = {
  id: string;
  code?: string | null;
  name?: string | null;
  price_monthly?: unknown;
  price_setup?: unknown;
  metadata?: Record<string, unknown> | null;
};

type AddonRow = {
  id: string;
  name?: string | null;
  price?: unknown;
  is_recurring?: boolean | null;
};

type MidtransSubscriptionResponse = {
  id: string;
  status: 'active' | 'inactive' | 'pending';
  schedule?: {
    interval?: number;
    interval_unit?: 'day' | 'week' | 'month' | 'year';
  };
  va_numbers?: Array<{ bank?: string; va_number?: string }>;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

const toNumeric = (value: unknown): number => {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
};

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

async function sha512(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-512', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const buildSignature = async (reference: string, statusCode: string, grossAmount: string, serverKey: string): Promise<string> =>
  await sha512(`${reference}${statusCode}${grossAmount}${serverKey}`);

export class MidtransProvider implements PaymentProvider {
  readonly name = 'midtrans';
  private readonly serverKey: string;
  private readonly environment: 'production' | 'sandbox';
  private readonly couponRepository?: ICouponRepository;
  private readonly packageRepository?: IPackageRepository;
  private readonly addonRepository?: IAddonRepository;
  private readonly httpClient: ResilientHttpClient;

  constructor(options: MidtransOptions) {
    if (!options.serverKey) {
      throw new Error('Midtrans server key wajib diisi');
    }
    this.serverKey = options.serverKey;
    this.environment = options.environment ?? 'sandbox';
    this.couponRepository = options.couponRepository;
    this.packageRepository = options.packageRepository;
    this.addonRepository = options.addonRepository;

    this.httpClient = new ResilientHttpClient({
      baseURL: MIDTRANS_BASE[this.environment].api,
      timeout: 30000,
      maxRetries: 2,
      circuitBreakerEnabled: true,
      defaultHeaders: {
        Authorization: this.authorizationHeader(),
      },
    });
  }

  private get endpoints() {
    return MIDTRANS_BASE[this.environment];
  }

  private authorizationHeader() {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${this.serverKey}:`);
    let binaryString = '';
    const len = data.byteLength;
    for (let i = 0; i < len; i++) {
      binaryString += String.fromCharCode(data[i]);
    }
    const encoded = globalThis.btoa(binaryString);
    return `Basic ${encoded}`;
  }

  private couponMetadataMessage(coupon: Coupon, key: string): string | undefined {
    if (!coupon.metadata || typeof coupon.metadata !== 'object') {
      return undefined;
    }
    const value = coupon.metadata[key];
    return typeof value === 'string' ? value : undefined;
  }

  private async fetchPackageRow(identifier: string): Promise<PackageRow | null> {
    if (!this.packageRepository) {
      return null;
    }

    const packageData = await this.packageRepository.findByIdentifier(identifier);

    if (!packageData) {
      return null;
    }

    return packageData as PackageRow;
  }

  private async fetchAddonRows(ids: string[]): Promise<AddonRow[]> {
    if (!this.addonRepository) {
      return [];
    }

    const addonData = await this.addonRepository.findByIds(ids);

    return addonData as AddonRow[];
  }

  private resolveScheduleSettings(payload: SubscriptionPayload) {
    const schedule = payload.schedule;
    const intervalUnit = schedule?.intervalUnit ?? 'month';
    const interval = schedule?.interval && schedule.interval > 0 ? schedule.interval : 1;
    const maxIntervalDefault = intervalUnit === 'year' ? 5 : 12;

    return {
      interval,
      intervalUnit,
      maxInterval: schedule?.maxInterval && schedule.maxInterval > 0 ? schedule.maxInterval : maxIntervalDefault,
      startAt: schedule?.startAt,
    };
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

    const data = await this.httpClient.post<{ token: string; redirect_url: string; expiry_time?: string }>(
      '/snap/transactions',
      body,
      {
        context: {
          serviceName: 'midtrans-snap',
          operationName: 'createCheckoutSession',
        },
        timeout: 20000,
        retries: 2,
      }
    );

    return {
      id: data.token,
      url: data.redirect_url,
      reference: orderReference,
      expiresAt: data.expiry_time ?? new Date(Date.now() + DEFAULT_EXPIRY_MINUTES * 60 * 1000).toISOString(),
      providerPayload: data,
    };
  }

  async createSubscription(payload: SubscriptionPayload): Promise<ProviderSubscription> {
    const metadataRecord = (payload.metadata ?? {}) as Record<string, unknown>;

    const metadataAmount = toNumeric(metadataRecord.amount ?? metadataRecord.price);
    const metadataPackageCode = typeof metadataRecord.packageCode === 'string' ? metadataRecord.packageCode : null;
    const metadataPackageName =
      typeof metadataRecord.packageName === 'string' ? metadataRecord.packageName : undefined;
    const metadataReference =
      typeof metadataRecord.reference === 'string' ? metadataRecord.reference : undefined;
    const metadataSubscriptionName =
      typeof metadataRecord.subscriptionName === 'string'
        ? metadataRecord.subscriptionName
        : undefined;

    const packageRow = await this.fetchPackageRow(payload.packageId);
    const addonRows = await this.fetchAddonRows(payload.addons ?? []);

    if (!packageRow && metadataAmount <= 0) {
      throw new Error(
        'Paket langganan tidak ditemukan. Metadata.amount tidak disediakan.'
      );
    }

    const resolvedPackage: PackageRow =
      packageRow ?? {
        id: payload.packageId,
        code: metadataPackageCode,
        name: metadataPackageName ?? payload.packageId,
        price_monthly: metadataAmount > 0 ? metadataAmount : undefined,
        price_setup: undefined,
        metadata: metadataRecord,
      };

    let amount = toNumeric(resolvedPackage.price_monthly ?? resolvedPackage.price_setup);

    for (const addon of addonRows) {
      if (addon.is_recurring === false) {
        continue;
      }
      amount += toNumeric(addon.price);
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Nominal langganan tidak valid. Periksa data paket atau metadata.amount.');
    }

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

    const normalizedAmount = Math.max(0, Math.round(amount));

    if (normalizedAmount <= 0) {
      throw new Error('Nominal langganan tidak boleh nol. Periksa data paket atau metadata.amount.');
    }

    const paymentType = payload.payment?.type ?? 'credit_card';
    if (paymentType !== 'credit_card') {
      throw new Error(`Metode pembayaran "${paymentType}" belum didukung.`);
    }

    const paymentToken = payload.payment?.token;
    if (!paymentToken) {
      throw new Error('Token pembayaran wajib disediakan untuk langganan Midtrans.');
    }

    const scheduleSettings = this.resolveScheduleSettings(payload);

    const schedulePayload: { interval: number; interval_unit: string; max_interval: number; start_time?: string } = {
      interval: scheduleSettings.interval,
      interval_unit: scheduleSettings.intervalUnit,
      max_interval: scheduleSettings.maxInterval,
    };

    if (scheduleSettings.startAt) {
      schedulePayload.start_time = scheduleSettings.startAt;
    }

    const metadataPayload = {
      package_id: resolvedPackage.id,
      package_code: resolvedPackage.code,
      addons: addonRows.map((addon) => addon.id),
      reference: metadataReference ?? payload.packageId,
    };

    const body = {
      name: metadataSubscriptionName ?? resolvedPackage.name ?? payload.packageId,
      amount: normalizedAmount,
      currency: 'IDR',
      payment_type: paymentType,
      token: paymentToken,
      schedule: schedulePayload,
      customer_details: {
        first_name: payload.customer.name,
        email: payload.customer.email,
        phone: payload.customer.phone,
      },
      metadata: metadataPayload,
    };

    const data = await this.httpClient.post<MidtransSubscriptionResponse>(
      '/subscriptions',
      body,
      {
        context: {
          serviceName: 'midtrans-api',
          operationName: 'createSubscription',
        },
        timeout: 25000,
        retries: 2,
      }
    );
    const intervalUnit = data.schedule?.interval_unit ?? scheduleSettings.intervalUnit;
    const scheduleLabel: 'monthly' | 'yearly' = intervalUnit === 'year' ? 'yearly' : 'monthly';

    const virtualAccount = Array.isArray(data.va_numbers) && data.va_numbers.length > 0
      ? data.va_numbers[0]?.va_number ?? undefined
      : undefined;

    return {
      id: data.id,
      status: data.status,
      schedule: scheduleLabel,
      virtualAccount,
      providerPayload: data,
    };
  }

  async applyCoupon(_reference: string, code: string): Promise<CouponResult> {
    if (!this.couponRepository) {
      return {
        code: code.trim().toUpperCase(),
        valid: false,
        message: 'Coupon repository not available.',
      };
    }

    const normalizedCode = code.trim().toUpperCase();
    const coupon = await this.couponRepository.findByCode(normalizedCode);

    if (!coupon) {
      return {
        code: normalizedCode,
        valid: false,
        message: 'Kupon tidak ditemukan atau tidak dapat diproses.',
      };
    }

    if (coupon.is_active === false) {
      return {
        code: normalizedCode,
        valid: false,
        message: 'Kupon sudah tidak aktif.',
      };
    }

    if (coupon.expires_at) {
      const expiry = new Date(coupon.expires_at);
      if (Number.isFinite(expiry.getTime()) && expiry.getTime() < Date.now()) {
        return {
          code: normalizedCode,
          valid: false,
          message: 'Kupon telah kedaluwarsa.',
        };
      }
    }

    if (
      typeof coupon.max_redemptions === 'number' &&
      typeof coupon.redemption_count === 'number' &&
      coupon.redemption_count >= coupon.max_redemptions
    ) {
      return {
        code: normalizedCode,
        valid: false,
        message: 'Kupon sudah mencapai batas penggunaan.',
      };
    }

    const amountOff = toNumeric(coupon.amount_off);
    const percentOff = toNumeric(coupon.percent_off);

    if (amountOff <= 0 && percentOff <= 0) {
      return {
        code: normalizedCode,
        valid: false,
        message: 'Kupon tidak memiliki nilai diskon yang berlaku.',
      };
    }

    const successMessage =
      this.couponMetadataMessage(coupon, 'success_message') ?? 'Kupon berhasil diterapkan.';

    return {
      code: normalizedCode,
      valid: true,
      amountOff: amountOff > 0 ? amountOff : undefined,
      percentOff: percentOff > 0 ? percentOff : undefined,
      message: successMessage,
    };
  }

  async verifyWebhook(payload: unknown, signature: string): Promise<boolean> {
    const midtransPayload = payload as MidtransWebhookPayload;

    const reference = String(midtransPayload?.order_id ?? '');
    const statusCode = String(midtransPayload?.status_code ?? '');
    const grossAmount = String(midtransPayload?.gross_amount ?? '');

    if (!reference || !statusCode || !grossAmount || !signature) {
      return false;
    }

    const expectedSignature = await buildSignature(reference, statusCode, grossAmount, this.serverKey);

    if (signature !== expectedSignature) {
      return false;
    }

    if (midtransPayload?.transaction_time) {
      const transactionTime = new Date(midtransPayload.transaction_time);
      const now = new Date();
      const fiveMinutes = 5 * 60 * 1000;

      if (Number.isNaN(transactionTime.getTime())) {
        return false;
      }

      if (now.getTime() - transactionTime.getTime() > fiveMinutes) {
        return false;
      }
    }

    return true;
  }

  async getPaymentStatus(reference: string): Promise<PaymentRecord> {
    const data = await this.httpClient.get<Record<string, unknown> & {
      transaction_status?: string;
      gross_amount?: string;
      currency?: string;
    }>(
      `/transactions/${reference}/status`,
      {
        context: {
          serviceName: 'midtrans-api',
          operationName: 'getPaymentStatus',
        },
        timeout: 15000,
        retries: 2,
      }
    );

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
      status_code?: string;
    };

    const reference = String(payload.order_id ?? '');
    if (!reference) {
      throw new Error('Payload webhook tidak memiliki order_id');
    }

    const statusCode = String(payload.status_code ?? '');
    const grossAmount = String(payload.gross_amount ?? '');
    const signatureHeader = headers['x-callback-token'] ?? headers['x-callback-signature'] ?? '';
    const signature = payload.signature_key ?? signatureHeader;

    const expectedSignature = await buildSignature(reference, statusCode, grossAmount, this.serverKey);
    const signatureValid = signature === expectedSignature && Boolean(signature);
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
