import type { IRepository } from './base';

export interface Addon {
  id: string;
  client_id?: string | null;
  name: string | null;
  price?: number | null;
  is_recurring?: boolean | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface AddonInsert {
  client_id?: string | null;
  name: string;
  price?: number | null;
  is_recurring?: boolean | null;
  metadata?: Record<string, unknown> | null;
}

export interface AddonUpdate {
  name?: string;
  price?: number | null;
  is_recurring?: boolean | null;
  metadata?: Record<string, unknown> | null;
  deleted_at?: string | null;
}

export interface IAddonRepository extends IRepository<Addon, AddonInsert, AddonUpdate> {
  findByIds(ids: string[]): Promise<Addon[]>;
  findByClientId(clientId: string): Promise<Addon[]>;
}
