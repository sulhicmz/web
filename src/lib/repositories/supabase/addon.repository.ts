import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js';

import type {
  IAddonRepository,
  Addon,
  AddonInsert,
  AddonUpdate,
} from '../addon.repository';
import type { RepositoryResult, PaginatedRepositoryResult } from '../base';

export class SupabaseAddonRepository implements IAddonRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<RepositoryResult<Addon>> {
    const { data, error } = await this.client
      .from('addons')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    return { data: data as Addon | null, error };
  }

  async findAll(options?: { select?: string }): Promise<PaginatedRepositoryResult<Addon>> {
    const { data, error, count } = await this.client
      .from('addons')
      .select(options?.select ?? '*', { count: 'exact' })
      .is('deleted_at', null);

    return { data: data as unknown as Addon[], count, error: error as PostgrestError | null };
  }

  async create(data: AddonInsert): Promise<RepositoryResult<Addon>> {
    const { data: result, error } = await this.client
      .from('addons')
      .insert(data)
      .select()
      .single();

    return { data: result as Addon | null, error };
  }

  async update(id: string, data: AddonUpdate): Promise<RepositoryResult<Addon>> {
    const { data: result, error } = await this.client
      .from('addons')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    return { data: result as Addon | null, error };
  }

  async delete(id: string): Promise<RepositoryResult<void>> {
    const { error } = await this.client
      .from('addons')
      .delete()
      .eq('id', id);

    return { data: null, error };
  }

  async findByIds(ids: string[]): Promise<Addon[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    const { data, error } = await this.client
      .from('addons')
      .select('id, name, price, is_recurring')
      .in('id', ids);

    if (error) {
      console.error('[SupabaseAddonRepository] failed to load addons', error.message);
      return [];
    }

    return data as unknown as Addon[];
  }

  async findByClientId(clientId: string): Promise<Addon[]> {
    const { data, error } = await this.client
      .from('addons')
      .select('*')
      .eq('client_id', clientId)
      .is('deleted_at', null);

    if (error) {
      console.error('[SupabaseAddonRepository] failed to load addons by client', error.message);
      return [];
    }

    return data as unknown as Addon[];
  }
}
