import { z } from 'zod';
import { uuidSchema } from './common';

export const clientStatusEnum = z.enum(['active', 'inactive', 'suspended', 'pending']);

export const clientBaseSchema = z.object({
  name: z.string().min(1, 'Client name is required').max(255),
  slug: z.string().max(255).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').nullable().optional(),
  industry: z.string().max(255).nullable().optional(),
  status: clientStatusEnum.default('active'),
});

export const clientInsertSchema = clientBaseSchema.omit({ status: true }).extend({
  status: clientStatusEnum.optional().default('active'),
});

export const clientUpdateSchema = clientBaseSchema.partial();

export const clientQuerySchema = z.object({
  id: uuidSchema.optional(),
  slug: z.string().max(255).nullable().optional(),
  status: clientStatusEnum.optional(),
});

export const clientWithProjectsSchema = clientBaseSchema.extend({
  id: uuidSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable(),
  projects: z.array(z.any()).optional(),
});

export type Client = z.infer<typeof clientBaseSchema> & {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ClientInsert = z.infer<typeof clientInsertSchema>;
export type ClientUpdate = z.infer<typeof clientUpdateSchema>;
export type ClientQuery = z.infer<typeof clientQuerySchema>;
