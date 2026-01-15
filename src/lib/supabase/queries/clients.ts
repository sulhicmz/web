import type { SupabaseClient } from '@supabase/supabase-js';

interface QueryOptions {
  select?: string;
  orderBy?: {
    column: string;
    ascending?: boolean;
  } | {
    column: string;
    ascending?: boolean;
  }[];
  limit?: number;
  offset?: number;
}

export interface Client {
  id: string;
  name: string;
  slug: string | null;
  industry: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ClientInsert {
  name: string;
  slug?: string | null;
  industry?: string | null;
  status?: string;
}

export interface ClientUpdate {
  name?: string;
  slug?: string | null;
  industry?: string | null;
  status?: string;
  deleted_at?: string | null;
}

export const clientQueries = {
  getById: (id: string, options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('clients')
      .select(options?.select ?? '*')
      .eq('id', id)
      .maybeSingle(),

  getBySlug: (slug: string, options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('clients')
      .select(options?.select ?? '*')
      .eq('slug', slug)
      .maybeSingle(),

  getAll: (options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('clients')
      .select(options?.select ?? '*'),

  getActive: (options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('clients')
      .select(options?.select ?? '*')
      .is('deleted_at', null)
      .eq('status', 'active'),

  create: (data: ClientInsert) =>
    (client: SupabaseClient) => client
      .from('clients')
      .insert(data)
      .select()
      .single(),

  update: (id: string, data: ClientUpdate) =>
    (client: SupabaseClient) => client
      .from('clients')
      .update(data)
      .eq('id', id)
      .select()
      .single(),

  softDelete: (id: string) =>
    (client: SupabaseClient) => client
      .from('clients')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),

  restore: (id: string) =>
    (client: SupabaseClient) => client
      .from('clients')
      .update({ deleted_at: null })
      .eq('id', id)
      .select()
      .single(),

  hardDelete: (id: string) =>
    (client: SupabaseClient) => client
      .from('clients')
      .delete()
      .eq('id', id),
};
