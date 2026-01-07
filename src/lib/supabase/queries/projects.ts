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

export interface Project {
  id: string;
  client_id: string;
  package_id: string | null;
  name: string;
  slug: string | null;
  staging_url: string | null;
  production_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProjectInsert {
  client_id: string;
  package_id?: string | null;
  name: string;
  slug?: string | null;
  staging_url?: string | null;
  production_url?: string | null;
  status?: string;
}

export interface ProjectUpdate {
  name?: string;
  slug?: string | null;
  staging_url?: string | null;
  production_url?: string | null;
  status?: string;
  deleted_at?: string | null;
}

export const projectQueries = {
  getById: (id: string, options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('projects')
      .select(options?.select ?? '*')
      .eq('id', id)
      .maybeSingle(),

  getByClient: (clientId: string, options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('projects')
      .select(options?.select ?? '*')
      .eq('client_id', clientId)
      .is('deleted_at', null),

  getBySlug: (slug: string, options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('projects')
      .select(options?.select ?? '*')
      .eq('slug', slug)
      .maybeSingle(),

  getAll: (options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('projects')
      .select(options?.select ?? '*')
      .is('deleted_at', null),

  getActive: (options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('projects')
      .select(options?.select ?? '*')
      .eq('status', 'active')
      .is('deleted_at', null),

  create: (data: ProjectInsert) =>
    (client: SupabaseClient) => client
      .from('projects')
      .insert(data)
      .select()
      .single(),

  update: (id: string, data: ProjectUpdate) =>
    (client: SupabaseClient) => client
      .from('projects')
      .update(data)
      .eq('id', id)
      .select()
      .single(),

  softDelete: (id: string) =>
    (client: SupabaseClient) => client
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),

  restore: (id: string) =>
    (client: SupabaseClient) => client
      .from('projects')
      .update({ deleted_at: null })
      .eq('id', id)
      .select()
      .single(),

  hardDelete: (id: string) =>
    (client: SupabaseClient) => client
      .from('projects')
      .delete()
      .eq('id', id),

  withClient: (projectId: string) =>
    (client: SupabaseClient) => client
      .from('projects')
      .select(`
        *,
        clients (*)
      `)
      .eq('id', projectId)
      .maybeSingle(),

  withPackage: (projectId: string) =>
    (client: SupabaseClient) => client
      .from('projects')
      .select(`
        *,
        packages (*)
      `)
      .eq('id', projectId)
      .maybeSingle(),

  withDetails: (projectId: string) =>
    (client: SupabaseClient) => client
      .from('projects')
      .select(`
        *,
        clients (*),
        packages (*),
        websites (*)
      `)
      .eq('id', projectId)
      .maybeSingle(),
};
