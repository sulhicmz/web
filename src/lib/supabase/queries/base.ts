import type { PostgrestError } from '@supabase/supabase-js';

export interface QueryResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

export interface PaginatedQueryResult<T> {
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
  single?: boolean;
  maybeSingle?: boolean;
}

export function buildSelect(
  columns: string | string[] | undefined
): string {
  if (!columns) return '*';
  if (typeof columns === 'string') return columns;
  return columns.join(', ');
}

export function buildOrderBy(
  orderBy: QueryOptions['orderBy']
): { column: string; ascending?: boolean }[] {
  if (!orderBy) return [];
  if (Array.isArray(orderBy)) return orderBy;
  return [orderBy];
}
