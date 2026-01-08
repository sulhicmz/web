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

export interface IClientRepository extends IRepository<Client, ClientInsert, ClientUpdate> {
  getBySlug(slug: string, options?: QueryOptions): Promise<Client | null>;
  getActive(options?: QueryOptions): Promise<Client[]>;
  softDelete(id: string): Promise<Client | null>;
  restore(id: string): Promise<Client | null>;
}
