import type { SupabaseClient } from '@supabase/supabase-js';
import { DIContainer } from './container';
import { getServiceClient } from '../supabase/server';
import type { StateContext } from '../state/state-context';
import { ServerStateContext } from '../state/server-state-context';
import { ClientStateContext } from '../state/client-state-context';
import { AppStateStore } from '../state/app-state';
import { SupabaseCouponRepository } from '../repositories/supabase/coupon.repository';
import { SupabasePackageRepository } from '../repositories/supabase/package.repository';
import { SupabaseAddonRepository } from '../repositories/supabase/addon.repository';
import { SupabaseProjectRepository } from '../repositories/supabase/project.repository';
import { SupabaseClientRepository } from '../repositories/supabase/client.repository';
import { SupabaseInvoiceRepository } from '../repositories/supabase/invoice.repository';
import { SupabaseUserProfileRepository } from '../repositories/supabase/user-profile.repository';
import { MidtransProvider } from '../payments/providers/midtrans';
import { DefaultErrorMessageProvider } from '../error-handler/default-error-message-provider';

const container = new DIContainer();

export function getContainer(): DIContainer {
  return container;
}

export function initializeContainer(supabaseClient?: SupabaseClient): void {
  const client = supabaseClient || getServiceClient();

  container.register('error-message-provider', () => new DefaultErrorMessageProvider(), 'singleton');
  container.register('server-state-context', () => new ServerStateContext(), 'singleton');
  container.register('client-state-context', () => new ClientStateContext(), 'singleton');
  container.register('server-app-state', () => new AppStateStore(container.resolve('server-state-context') as StateContext), 'singleton');
  container.register('client-app-state', () => new AppStateStore(container.resolve('client-state-context') as StateContext), 'singleton');

  container.register('coupon-repository', () => new SupabaseCouponRepository(client), 'singleton');
  container.register('package-repository', () => new SupabasePackageRepository(client), 'singleton');
  container.register('addon-repository', () => new SupabaseAddonRepository(client), 'singleton');
  container.register('project-repository', () => new SupabaseProjectRepository(client), 'singleton');
  container.register('client-repository', () => new SupabaseClientRepository(client), 'singleton');
  container.register('invoice-repository', () => new SupabaseInvoiceRepository(client), 'singleton');
  container.register('user-profile-repository', () => new SupabaseUserProfileRepository(client), 'singleton');

  container.register('payment-provider', () => {
    return new MidtransProvider({
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      environment: (process.env.MIDTRANS_IS_PRODUCTION === 'true') ? 'production' : 'sandbox',
      couponRepository: container.resolve('coupon-repository'),
      packageRepository: container.resolve('package-repository'),
      addonRepository: container.resolve('addon-repository'),
    });
  }, 'singleton');
}

export function resetContainer(): void {
  container.clear();
}
