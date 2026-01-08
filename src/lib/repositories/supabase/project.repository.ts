import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  IProjectRepository,
  Project,
  ProjectInsert,
  ProjectUpdate,
  QueryOptions,
} from '../project.repository';
import type { RepositoryResult, PaginatedRepositoryResult } from '../base';

export class SupabaseProjectRepository implements IProjectRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<RepositoryResult<Project>> {
    const { data, error } = await this.client
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    return { data: data as Project | null, error };
  }

  async findAll(options?: QueryOptions): Promise<PaginatedRepositoryResult<Project>> {
    const { data, error, count } = await this.client
      .from('projects')
      .select(options?.select ?? '*', { count: 'exact' })
      .is('deleted_at', null);

    return { data: (data as Project[] | null) ?? [], count, error };
  }

  async create(data: ProjectInsert): Promise<RepositoryResult<Project>> {
    const { data: result, error } = await this.client
      .from('projects')
      .insert(data)
      .select()
      .single();

    return { data: result as Project | null, error };
  }

  async update(id: string, data: ProjectUpdate): Promise<RepositoryResult<Project>> {
    const { data: result, error } = await this.client
      .from('projects')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    return { data: result as Project | null, error };
  }

  async delete(id: string): Promise<RepositoryResult<void>> {
    const { error } = await this.client
      .from('projects')
      .delete()
      .eq('id', id);

    return { data: null, error };
  }

  async getByClient(clientId: string, options?: QueryOptions): Promise<Project[]> {
    const { data, error } = await this.client
      .from('projects')
      .select(options?.select ?? '*')
      .eq('client_id', clientId)
      .is('deleted_at', null);

    if (error) {
      console.error('[SupabaseProjectRepository] failed to load projects by client', error.message);
      return [];
    }

    return (data as unknown as Project[]) ?? [];
  }

  async getBySlug(slug: string, options?: QueryOptions): Promise<Project | null> {
    const { data, error } = await this.client
      .from('projects')
      .select(options?.select ?? '*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseProjectRepository] failed to load project by slug', error.message);
      return null;
    }

    return data as Project | null;
  }

  async getActive(options?: QueryOptions): Promise<Project[]> {
    const { data, error } = await this.client
      .from('projects')
      .select(options?.select ?? '*')
      .eq('status', 'active')
      .is('deleted_at', null);

    if (error) {
      console.error('[SupabaseProjectRepository] failed to load active projects', error.message);
      return [];
    }

    return (data as unknown as Project[]) ?? [];
  }

  async softDelete(id: string): Promise<Project | null> {
    const { data, error } = await this.client
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseProjectRepository] failed to soft delete project', error.message);
      return null;
    }

    return data as Project | null;
  }

  async restore(id: string): Promise<Project | null> {
    const { data, error } = await this.client
      .from('projects')
      .update({ deleted_at: null })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseProjectRepository] failed to restore project', error.message);
      return null;
    }

    return data as Project | null;
  }

  async withClient(projectId: string): Promise<Project | null> {
    const { data, error } = await this.client
      .from('projects')
      .select(`
        *,
        clients (*)
      `)
      .eq('id', projectId)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseProjectRepository] failed to load project with client', error.message);
      return null;
    }

    return data as Project | null;
  }

  async withPackage(projectId: string): Promise<Project | null> {
    const { data, error } = await this.client
      .from('projects')
      .select(`
        *,
        packages (*)
      `)
      .eq('id', projectId)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseProjectRepository] failed to load project with package', error.message);
      return null;
    }

    return data as Project | null;
  }

  async withDetails(projectId: string): Promise<Project | null> {
    const { data, error } = await this.client
      .from('projects')
      .select(`
        *,
        clients (*),
        packages (*),
        websites (*)
      `)
      .eq('id', projectId)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseProjectRepository] failed to load project with details', error.message);
      return null;
    }

    return data as Project | null;
  }
}
