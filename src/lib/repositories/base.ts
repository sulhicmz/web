import type { PostgrestError } from '@supabase/supabase-js';

export interface RepositoryResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

export interface PaginatedRepositoryResult<T> {
  data: T[];
  count: number | null;
  error: PostgrestError | null;
}

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

export interface IRepository<T, TInsert = Partial<T>, TUpdate = Partial<T>> {
  findById(id: string): Promise<RepositoryResult<T>>;
  findAll(options?: QueryOptions): Promise<PaginatedRepositoryResult<T>>;
  create(data: TInsert): Promise<RepositoryResult<T>>;
  update(id: string, data: TUpdate): Promise<RepositoryResult<T>>;
  delete(id: string): Promise<RepositoryResult<void>>;
}
