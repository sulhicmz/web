import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  IClientRepository,
  Client,
  ClientInsert,
  ClientUpdate,
  QueryOptions,
} from '../client.repository';
import type { RepositoryResult } from '../base';

export class SupabaseClientRepository implements IClientRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<RepositoryResult<Client>> {
    const { data, error } = await this.client
      .from('clients')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    return { data: data as Client | null, error };
  }

  async findAll(options?: QueryOptions): Promise<{ data: Client[]; count: number | null; error: any }> {
    const { data, error, count } = await this.client
      .from('clients')
      .select(options?.select ?? '*', { count: 'exact' });

    return { data: data as unknown as Client[], count, error };
  }

  async create(data: ClientInsert): Promise<RepositoryResult<Client>> {
    const { data: result, error } = await this.client
      .from('clients')
      .insert(data)
      .select()
      .single();

    return { data: result as Client | null, error };
  }

  async update(id: string, data: ClientUpdate): Promise<RepositoryResult<Client>> {
    const { data: result, error } = await this.client
      .from('clients')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    return { data: result as Client | null, error };
  }

  async delete(id: string): Promise<RepositoryResult<void>> {
    const { error } = await this.client
      .from('clients')
      .delete()
      .eq('id', id);

    return { data: null, error };
  }

  async getBySlug(slug: string, options?: QueryOptions): Promise<Client | null> {
    const { data, error } = await this.client
      .from('clients')
      .select(options?.select ?? '*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseClientRepository] failed to load client by slug', error.message);
      return null;
    }

    return data as Client | null;
  }

  async getActive(options?: QueryOptions): Promise<Client[]> {
    const { data, error } = await this.client
      .from('clients')
      .select(options?.select ?? '*')
      .is('deleted_at', null)
      .eq('status', 'active');

    if (error) {
      console.error('[SupabaseClientRepository] failed to load active clients', error.message);
      return [];
    }

    return data as unknown as Client[];
  }

  async softDelete(id: string): Promise<Client | null> {
    const { data, error } = await this.client
      .from('clients')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseClientRepository] failed to soft delete client', error.message);
      return null;
    }

    return data as Client | null;
  }

  async restore(id: string): Promise<Client | null> {
    const { data, error } = await this.client
      .from('clients')
      .update({ deleted_at: null })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseClientRepository] failed to restore client', error.message);
      return null;
    }

    return data as Client | null;
  }
}
