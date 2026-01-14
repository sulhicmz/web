import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js';

import type {
  IPackageRepository,
  Package,
  PackageInsert,
  PackageUpdate,
} from '../package.repository';
import type { RepositoryResult, PaginatedRepositoryResult } from '../base';

export class SupabasePackageRepository implements IPackageRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<RepositoryResult<Package>> {
    const { data, error } = await this.client
      .from('packages')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    return { data: data as Package | null, error };
  }

  async findAll(options?: { select?: string }): Promise<PaginatedRepositoryResult<Package>> {
    const { data, error, count } = await this.client
      .from('packages')
      .select(options?.select ?? '*', { count: 'exact' })
      .is('deleted_at', null);

    return { data: data as unknown as Package[], count, error: error as PostgrestError | null };
  }

  async create(data: PackageInsert): Promise<RepositoryResult<Package>> {
    const { data: result, error } = await this.client
      .from('packages')
      .insert(data)
      .select()
      .single();

    return { data: result as Package | null, error };
  }

  async update(id: string, data: PackageUpdate): Promise<RepositoryResult<Package>> {
    const { data: result, error } = await this.client
      .from('packages')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    return { data: result as Package | null, error };
  }

  async delete(id: string): Promise<RepositoryResult<void>> {
    const { error } = await this.client
      .from('packages')
      .delete()
      .eq('id', id);

    return { data: null, error };
  }

  async findByIdentifier(identifier: string): Promise<Package | null> {
    const selectColumns = 'id, code, name, price_monthly, price_setup, metadata';

    const byId = await this.client
      .from('packages')
      .select(selectColumns)
      .eq('id', identifier)
      .maybeSingle();

    if (!byId.error && byId.data) {
      return byId.data as Package | null;
    }

    if (byId.error && byId.error.code && byId.error.code !== 'PGRST116') {
      console.error('[SupabasePackageRepository] failed to load package (id)', byId.error.message);
      return null;
    }

    const byCode = await this.client
      .from('packages')
      .select(selectColumns)
      .eq('code', identifier)
      .maybeSingle();

    if (byCode.error) {
      console.error('[SupabasePackageRepository] failed to load package (code)', byCode.error.message);
      return null;
    }

    return byCode.data as Package | null;
  }

  async findByCode(code: string): Promise<Package | null> {
    const { data, error } = await this.client
      .from('packages')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (error) {
      console.error('[SupabasePackageRepository] failed to load package by code', error.message);
      return null;
    }

    return data as Package | null;
  }

  async getActivePackages(): Promise<Package[]> {
    const { data, error } = await this.client
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null);

    if (error) {
      console.error('[SupabasePackageRepository] failed to load active packages', error.message);
      return [];
    }

    return data as unknown as Package[];
  }
}
