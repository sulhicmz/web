import type { SupabaseClient } from '@supabase/supabase-js';
import { getServiceClient } from '../supabase/server';
import { MidtransProvider } from './providers/midtrans';
import type { PaymentProvider } from './types';
import type { ICouponRepository, IPackageRepository, IAddonRepository } from '../repositories';
import { createRepositories } from '../repositories/factory';

export function createPaymentProvider(
  options: {
    serverKey: string;
    clientKey?: string;
    environment?: 'production' | 'sandbox';
    couponRepository?: ICouponRepository;
    packageRepository?: IPackageRepository;
    addonRepository?: IAddonRepository;
  }
): PaymentProvider {
  let supabaseClient: SupabaseClient | null = null;

  try {
    supabaseClient = getServiceClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Supabase service client unavailable';
    console.warn('[createPaymentProvider] Supabase service client unavailable', message);
  }

  if (options.couponRepository && options.packageRepository && options.addonRepository) {
    return new MidtransProvider({
      serverKey: options.serverKey,
      clientKey: options.clientKey,
      environment: options.environment ?? 'sandbox',
      couponRepository: options.couponRepository,
      packageRepository: options.packageRepository,
      addonRepository: options.addonRepository,
    });
  }

  if (supabaseClient) {
    const repositories = createRepositories(supabaseClient);
    return new MidtransProvider({
      serverKey: options.serverKey,
      clientKey: options.clientKey,
      environment: options.environment ?? 'sandbox',
      couponRepository: repositories.couponRepository,
      packageRepository: repositories.packageRepository,
      addonRepository: repositories.addonRepository,
    });
  }

  return new MidtransProvider({
    serverKey: options.serverKey,
    clientKey: options.clientKey,
    environment: options.environment ?? 'sandbox',
    couponRepository: undefined,
    packageRepository: undefined,
    addonRepository: undefined,
  });
}
