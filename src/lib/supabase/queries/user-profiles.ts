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

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  client_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileInsert {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  role: string;
  client_id?: string | null;
}

export interface UserProfileUpdate {
  full_name?: string | null;
  phone?: string | null;
  role?: string;
  client_id?: string | null;
}

export const userProfileQueries = {
  getById: (id: string, options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('user_profiles')
      .select(options?.select ?? '*')
      .eq('id', id)
      .maybeSingle(),

  getByClient: (clientId: string, options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('user_profiles')
      .select(options?.select ?? '*')
      .eq('client_id', clientId),

  getByRole: (role: string, options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('user_profiles')
      .select(options?.select ?? '*')
      .eq('role', role),

  getAll: (options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('user_profiles')
      .select(options?.select ?? '*'),

  create: (data: UserProfileInsert) =>
    (client: SupabaseClient) => client
      .from('user_profiles')
      .insert(data)
      .select()
      .single(),

  update: (id: string, data: UserProfileUpdate) =>
    (client: SupabaseClient) => client
      .from('user_profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single(),

  delete: (id: string) =>
    (client: SupabaseClient) => client
      .from('user_profiles')
      .delete()
      .eq('id', id),

  withClient: (userId: string) =>
    (client: SupabaseClient) => client
      .from('user_profiles')
      .select(`
        *,
        clients (*)
      `)
      .eq('id', userId)
      .maybeSingle(),

  getAdmins: (options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('user_profiles')
      .select(options?.select ?? '*')
      .in('role', ['owner', 'staff']),

  getClients: (options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('user_profiles')
      .select(options?.select ?? '*')
      .eq('role', 'client'),

  getTeamMembers: (clientId: string, options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('user_profiles')
      .select(options?.select ?? '*')
      .eq('client_id', clientId)
      .in('role', ['client', 'viewer']),
};
