import { z } from 'zod';
import { uuidSchema, jsonbSchema } from './common';

export const invoiceStatusEnum = z.enum(['draft', 'pending', 'paid', 'overdue', 'cancelled', 'refunded']);

export const invoiceBaseSchema = z.object({
  client_id: uuidSchema,
  subscription_id: uuidSchema.nullable().optional(),
  total: z.number().nonnegative('Total must be non-negative').max(999999999.99, 'Total exceeds maximum value'),
  currency: z.string().length(3, 'Currency must be 3-letter ISO code').default('IDR'),
  status: invoiceStatusEnum.default('draft'),
  due_date: z.string().datetime().nullable().optional(),
  issued_at: z.string().datetime().default(() => new Date().toISOString()),
  metadata: jsonbSchema.optional(),
});

export const invoiceInsertSchema = invoiceBaseSchema.omit({ status: true, issued_at: true }).extend({
  status: invoiceStatusEnum.optional().default('draft'),
  issued_at: z.string().datetime().optional(),
});

export const invoiceUpdateSchema = invoiceBaseSchema.partial();

export const invoiceQuerySchema = z.object({
  id: uuidSchema.optional(),
  client_id: uuidSchema.optional(),
  subscription_id: uuidSchema.nullable().optional(),
  status: invoiceStatusEnum.optional(),
  due_date_from: z.string().datetime().optional(),
  due_date_to: z.string().datetime().optional(),
});

export const invoiceWithRelationsSchema = invoiceBaseSchema.extend({
  id: uuidSchema,
  deleted_at: z.string().datetime().nullable(),
  clients: z.any().optional(),
  subscriptions: z.any().optional(),
  payments: z.array(z.any()).optional(),
});

export type Invoice = z.infer<typeof invoiceBaseSchema> & {
  id: string;
  deleted_at: string | null;
};

export type InvoiceInsert = z.infer<typeof invoiceInsertSchema>;
export type InvoiceUpdate = z.infer<typeof invoiceUpdateSchema>;
export type InvoiceQuery = z.infer<typeof invoiceQuerySchema>;
