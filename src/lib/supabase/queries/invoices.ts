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

export interface Invoice {
  id: string;
  client_id: string;
  subscription_id: string | null;
  total: number;
  currency: string;
  status: string;
  due_date: string | null;
  issued_at: string;
  metadata: Record<string, unknown>;
  deleted_at: string | null;
}

export interface InvoiceInsert {
  client_id: string;
  subscription_id?: string | null;
  total: number;
  currency?: string;
  status?: string;
  due_date?: string | null;
  metadata?: Record<string, unknown>;
}

export interface InvoiceUpdate {
  total?: number;
  status?: string;
  due_date?: string | null;
  metadata?: Record<string, unknown>;
  deleted_at?: string | null;
}

export const invoiceQueries = {
  getById: (id: string, options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('invoices')
      .select(options?.select ?? '*')
      .eq('id', id)
      .maybeSingle(),

  getByClient: (clientId: string, options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('invoices')
      .select(options?.select ?? '*')
      .eq('client_id', clientId)
      .is('deleted_at', null),

  getByStatus: (status: string, options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('invoices')
      .select(options?.select ?? '*')
      .eq('status', status)
      .is('deleted_at', null),

  getOverdue: (options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('invoices')
      .select(options?.select ?? '*')
      .lt('due_date', new Date().toISOString())
      .in('status', ['pending', 'overdue'])
      .is('deleted_at', null),

  getAll: (options?: QueryOptions) =>
    (client: SupabaseClient) => client
      .from('invoices')
      .select(options?.select ?? '*')
      .is('deleted_at', null),

  create: (data: InvoiceInsert) =>
    (client: SupabaseClient) => client
      .from('invoices')
      .insert(data)
      .select()
      .single(),

  update: (id: string, data: InvoiceUpdate) =>
    (client: SupabaseClient) => client
      .from('invoices')
      .update(data)
      .eq('id', id)
      .select()
      .single(),

  softDelete: (id: string) =>
    (client: SupabaseClient) => client
      .from('invoices')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),

  restore: (id: string) =>
    (client: SupabaseClient) => client
      .from('invoices')
      .update({ deleted_at: null })
      .eq('id', id)
      .select()
      .single(),

  hardDelete: (id: string) =>
    (client: SupabaseClient) => client
      .from('invoices')
      .delete()
      .eq('id', id),

  withClient: (invoiceId: string) =>
    (client: SupabaseClient) => client
      .from('invoices')
      .select(`
        *,
        clients (*)
      `)
      .eq('id', invoiceId)
      .maybeSingle(),

  withPayments: (invoiceId: string) =>
    (client: SupabaseClient) => client
      .from('invoices')
      .select(`
        *,
        payments (*)
      `)
      .eq('id', invoiceId)
      .maybeSingle(),

  withSubscription: (invoiceId: string) =>
    (client: SupabaseClient) => client
      .from('invoices')
      .select(`
        *,
        subscriptions (*)
      `)
      .eq('id', invoiceId)
      .maybeSingle(),

  withDetails: (invoiceId: string) =>
    (client: SupabaseClient) => client
      .from('invoices')
      .select(`
        *,
        clients (*),
        subscriptions (*),
        payments (*)
      `)
      .eq('id', invoiceId)
      .maybeSingle(),
};
