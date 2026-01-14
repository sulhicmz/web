import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  IInvoiceRepository,
  Invoice,
  InvoiceInsert,
  InvoiceUpdate,
} from '../invoice.repository';
import type { RepositoryResult, QueryOptions } from '../base';

export class SupabaseInvoiceRepository implements IInvoiceRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<RepositoryResult<Invoice>> {
    const { data, error } = await this.client
      .from('invoices')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    return { data: data as Invoice | null, error };
  }

  async findAll(options?: QueryOptions): Promise<{ data: Invoice[]; count: number | null; error: any }> {
    const { data, error, count } = await this.client
      .from('invoices')
      .select(options?.select ?? '*', { count: 'exact' })
      .is('deleted_at', null);

    return { data: data as unknown as Invoice[], count, error };
  }

  async create(data: InvoiceInsert): Promise<RepositoryResult<Invoice>> {
    const { data: result, error } = await this.client
      .from('invoices')
      .insert(data)
      .select()
      .single();

    return { data: result as Invoice | null, error };
  }

  async update(id: string, data: InvoiceUpdate): Promise<RepositoryResult<Invoice>> {
    const { data: result, error } = await this.client
      .from('invoices')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    return { data: result as Invoice | null, error };
  }

  async delete(id: string): Promise<RepositoryResult<void>> {
    const { error } = await this.client
      .from('invoices')
      .delete()
      .eq('id', id);

    return { data: null, error };
  }

  async getByClient(clientId: string, options?: QueryOptions): Promise<Invoice[]> {
    const { data, error } = await this.client
      .from('invoices')
      .select(options?.select ?? '*')
      .eq('client_id', clientId)
      .is('deleted_at', null);

    if (error) {
      console.error('[SupabaseInvoiceRepository] failed to load invoices by client', error.message);
      return [];
    }

    return data as unknown as Invoice[];
  }

  async getByStatus(status: string, options?: QueryOptions): Promise<Invoice[]> {
    const { data, error } = await this.client
      .from('invoices')
      .select(options?.select ?? '*')
      .eq('status', status)
      .is('deleted_at', null);

    if (error) {
      console.error('[SupabaseInvoiceRepository] failed to load invoices by status', error.message);
      return [];
    }

    return data as unknown as Invoice[];
  }

  async getOverdue(options?: QueryOptions): Promise<Invoice[]> {
    const { data, error } = await this.client
      .from('invoices')
      .select(options?.select ?? '*')
      .lt('due_date', new Date().toISOString())
      .in('status', ['pending', 'overdue'])
      .is('deleted_at', null);

    if (error) {
      console.error('[SupabaseInvoiceRepository] failed to load overdue invoices', error.message);
      return [];
    }

    return data as unknown as Invoice[];
  }

  async softDelete(id: string): Promise<Invoice | null> {
    const { data, error } = await this.client
      .from('invoices')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseInvoiceRepository] failed to soft delete invoice', error.message);
      return null;
    }

    return data as Invoice | null;
  }

  async restore(id: string): Promise<Invoice | null> {
    const { data, error } = await this.client
      .from('invoices')
      .update({ deleted_at: null })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseInvoiceRepository] failed to restore invoice', error.message);
      return null;
    }

    return data as Invoice | null;
  }

  async withClient(invoiceId: string): Promise<Invoice | null> {
    const { data, error } = await this.client
      .from('invoices')
      .select(`
        *,
        clients (*)
      `)
      .eq('id', invoiceId)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseInvoiceRepository] failed to load invoice with client', error.message);
      return null;
    }

    return data as Invoice | null;
  }

  async withPayments(invoiceId: string): Promise<Invoice | null> {
    const { data, error } = await this.client
      .from('invoices')
      .select(`
        *,
        payments (*)
      `)
      .eq('id', invoiceId)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseInvoiceRepository] failed to load invoice with payments', error.message);
      return null;
    }

    return data as Invoice | null;
  }

  async withSubscription(invoiceId: string): Promise<Invoice | null> {
    const { data, error } = await this.client
      .from('invoices')
      .select(`
        *,
        subscriptions (*)
      `)
      .eq('id', invoiceId)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseInvoiceRepository] failed to load invoice with subscription', error.message);
      return null;
    }

    return data as Invoice | null;
  }

  async withDetails(invoiceId: string): Promise<Invoice | null> {
    const { data, error } = await this.client
      .from('invoices')
      .select(`
        *,
        clients (*),
        subscriptions (*),
        payments (*)
      `)
      .eq('id', invoiceId)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseInvoiceRepository] failed to load invoice with details', error.message);
      return null;
    }

    return data as Invoice | null;
  }
}
