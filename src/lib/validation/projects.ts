import { z } from 'zod';
import { uuidSchema } from './common';

export const projectStatusEnum = z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']);

export const projectBaseSchema = z.object({
  client_id: uuidSchema,
  package_id: uuidSchema.nullable().optional(),
  name: z.string().min(1, 'Project name is required').max(255),
  slug: z.string().max(255).nullable().optional(),
  staging_url: z.string().url().nullable().optional(),
  production_url: z.string().url().nullable().optional(),
  status: projectStatusEnum.default('planning'),
});

export const projectInsertSchema = projectBaseSchema.omit({ status: true }).extend({
  status: projectStatusEnum.optional().default('planning'),
});

export const projectUpdateSchema = projectBaseSchema.partial();

export const projectQuerySchema = z.object({
  id: uuidSchema.optional(),
  client_id: uuidSchema.optional(),
  slug: z.string().nullable().optional(),
  status: projectStatusEnum.optional(),
});

export const projectWithRelationsSchema = projectBaseSchema.extend({
  id: uuidSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable(),
  clients: z.any().optional(),
  packages: z.any().optional(),
  websites: z.array(z.any()).optional(),
});

export type Project = z.infer<typeof projectBaseSchema> & {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ProjectInsert = z.infer<typeof projectInsertSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;
export type ProjectQuery = z.infer<typeof projectQuerySchema>;
