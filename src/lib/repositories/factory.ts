import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  ICouponRepository,
  IPackageRepository,
  IAddonRepository,
  IProjectRepository,
  IClientRepository,
  IInvoiceRepository,
  IUserProfileRepository,
} from './index';
import {
  SupabaseCouponRepository,
  SupabasePackageRepository,
  SupabaseAddonRepository,
  SupabaseProjectRepository,
  SupabaseClientRepository,
  SupabaseInvoiceRepository,
  SupabaseUserProfileRepository,
} from './supabase';

export interface RepositoryDependencies {
  couponRepository: ICouponRepository;
  packageRepository: IPackageRepository;
  addonRepository: IAddonRepository;
  projectRepository: IProjectRepository;
  clientRepository: IClientRepository;
  invoiceRepository: IInvoiceRepository;
  userProfileRepository: IUserProfileRepository;
}

export function createRepositories(supabaseClient: SupabaseClient): RepositoryDependencies {
  return {
    couponRepository: new SupabaseCouponRepository(supabaseClient),
    packageRepository: new SupabasePackageRepository(supabaseClient),
    addonRepository: new SupabaseAddonRepository(supabaseClient),
    projectRepository: new SupabaseProjectRepository(supabaseClient),
    clientRepository: new SupabaseClientRepository(supabaseClient),
    invoiceRepository: new SupabaseInvoiceRepository(supabaseClient),
    userProfileRepository: new SupabaseUserProfileRepository(supabaseClient),
  };
}

export function createCouponRepository(supabaseClient: SupabaseClient): ICouponRepository {
  return new SupabaseCouponRepository(supabaseClient);
}

export function createPackageRepository(supabaseClient: SupabaseClient): IPackageRepository {
  return new SupabasePackageRepository(supabaseClient);
}

export function createAddonRepository(supabaseClient: SupabaseClient): IAddonRepository {
  return new SupabaseAddonRepository(supabaseClient);
}

export function createProjectRepository(supabaseClient: SupabaseClient): IProjectRepository {
  return new SupabaseProjectRepository(supabaseClient);
}

export function createClientRepository(supabaseClient: SupabaseClient): IClientRepository {
  return new SupabaseClientRepository(supabaseClient);
}

export function createInvoiceRepository(supabaseClient: SupabaseClient): IInvoiceRepository {
  return new SupabaseInvoiceRepository(supabaseClient);
}

export function createUserProfileRepository(supabaseClient: SupabaseClient): IUserProfileRepository {
  return new SupabaseUserProfileRepository(supabaseClient);
}
