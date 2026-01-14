import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  IUserProfileRepository,
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate,
} from '../user-profile.repository';
import type { RepositoryResult, QueryOptions } from '../base';

export class SupabaseUserProfileRepository implements IUserProfileRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<RepositoryResult<UserProfile>> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    return { data: data as UserProfile | null, error };
  }

  async findAll(options?: QueryOptions): Promise<{ data: UserProfile[]; count: number | null; error: any }> {
    const { data, error, count } = await this.client
      .from('user_profiles')
      .select(options?.select ?? '*', { count: 'exact' });

    return { data: data as unknown as UserProfile[], count, error };
  }

  async create(data: UserProfileInsert): Promise<RepositoryResult<UserProfile>> {
    const { data: result, error } = await this.client
      .from('user_profiles')
      .insert(data)
      .select()
      .single();

    return { data: result as UserProfile | null, error };
  }

  async update(id: string, data: UserProfileUpdate): Promise<RepositoryResult<UserProfile>> {
    const { data: result, error } = await this.client
      .from('user_profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    return { data: result as UserProfile | null, error };
  }

  async delete(id: string): Promise<RepositoryResult<void>> {
    const { error } = await this.client
      .from('user_profiles')
      .delete()
      .eq('id', id);

    return { data: null, error };
  }

  async getByClient(clientId: string, options?: QueryOptions): Promise<UserProfile[]> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select(options?.select ?? '*')
      .eq('client_id', clientId);

    if (error) {
      console.error('[SupabaseUserProfileRepository] failed to load user profiles by client', error.message);
      return [];
    }

    return data as unknown as UserProfile[];
  }

  async getByRole(role: string, options?: QueryOptions): Promise<UserProfile[]> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select(options?.select ?? '*')
      .eq('role', role);

    if (error) {
      console.error('[SupabaseUserProfileRepository] failed to load user profiles by role', error.message);
      return [];
    }

    return data as unknown as UserProfile[];
  }

  async getAdmins(options?: QueryOptions): Promise<UserProfile[]> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select(options?.select ?? '*')
      .in('role', ['owner', 'staff']);

    if (error) {
      console.error('[SupabaseUserProfileRepository] failed to load admins', error.message);
      return [];
    }

    return data as unknown as UserProfile[];
  }

  async getClients(options?: QueryOptions): Promise<UserProfile[]> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select(options?.select ?? '*')
      .eq('role', 'client');

    if (error) {
      console.error('[SupabaseUserProfileRepository] failed to load clients', error.message);
      return [];
    }

    return data as unknown as UserProfile[];
  }

  async getTeamMembers(clientId: string, options?: QueryOptions): Promise<UserProfile[]> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select(options?.select ?? '*')
      .eq('client_id', clientId)
      .in('role', ['client', 'viewer']);

    if (error) {
      console.error('[SupabaseUserProfileRepository] failed to load team members', error.message);
      return [];
    }

    return data as unknown as UserProfile[];
  }

  async withClient(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select(`
        *,
        clients (*)
      `)
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseUserProfileRepository] failed to load user profile with client', error.message);
      return null;
    }

    return data as UserProfile | null;
  }
}
