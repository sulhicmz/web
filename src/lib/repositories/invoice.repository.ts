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

export interface IInvoiceRepository extends IRepository<Invoice, InvoiceInsert, InvoiceUpdate> {
  getByClient(clientId: string, options?: QueryOptions): Promise<Invoice[]>;
  getByStatus(status: string, options?: QueryOptions): Promise<Invoice[]>;
  getOverdue(options?: QueryOptions): Promise<Invoice[]>;
  softDelete(id: string): Promise<Invoice | null>;
  restore(id: string): Promise<Invoice | null>;
  withClient(invoiceId: string): Promise<Invoice | null>;
  withPayments(invoiceId: string): Promise<Invoice | null>;
  withSubscription(invoiceId: string): Promise<Invoice | null>;
  withDetails(invoiceId: string): Promise<Invoice | null>;
}
