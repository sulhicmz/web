import type { IRepository } from './base';

export interface QueryOptions {
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

export interface IProjectRepository extends IRepository<Project, ProjectInsert, ProjectUpdate> {
  getByClient(clientId: string, options?: QueryOptions): Promise<Project[]>;
  getBySlug(slug: string, options?: QueryOptions): Promise<Project | null>;
  getActive(options?: QueryOptions): Promise<Project[]>;
  softDelete(id: string): Promise<Project | null>;
  restore(id: string): Promise<Project | null>;
  withClient(projectId: string): Promise<Project | null>;
  withPackage(projectId: string): Promise<Project | null>;
  withDetails(projectId: string): Promise<Project | null>;
}
