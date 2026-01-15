import type { CheckoutPayload, PaymentProvider } from './types';
import { createPaymentProvider as createPaymentProviderWithRepos } from './factory';

const providerCache: { instance?: PaymentProvider | null } = {};

export const createPaymentProvider = (): PaymentProvider | null => {
  if (providerCache.instance !== undefined) {
    return providerCache.instance;
  }

  const providerName = import.meta.env.PAYMENT_PROVIDER?.toLowerCase();
  if (!providerName) {
    providerCache.instance = null;
    return providerCache.instance;
  }

  if (providerName === 'midtrans') {
    const serverKey = import.meta.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      providerCache.instance = null;
      return providerCache.instance;
    }
    const environment = import.meta.env.PAYMENT_ENV === 'production' ? 'production' : 'sandbox';
    providerCache.instance = createPaymentProviderWithRepos({ serverKey, environment });
    return providerCache.instance;
  }

  throw new Error(`Provider pembayaran "${providerName}" belum didukung`);
};

export const assertPaymentProvider = (): PaymentProvider => {
  const provider = createPaymentProvider();
  if (!provider) {
    throw new Error('Provider pembayaran belum dikonfigurasi dengan benar.');
  }
  return provider;
};

export const sanitizeCheckoutPayload = (payload: CheckoutPayload): CheckoutPayload => {
  const items = (payload.items ?? []).filter((item) => item.quantity > 0 && item.price >= 0);
  if (items.length === 0) {
    throw new Error('Daftar item checkout tidak valid.');
  }

  return {
    ...payload,
    items,
    reference: payload.reference ?? `order-${Date.now()}`,
    mode: payload.mode ?? 'one_time',
  };
};

export * from './types';
