import { z } from 'zod';
import { uuidSchema } from './common';

export const userRoleEnum = z.enum(['owner', 'staff', 'client', 'viewer']);

export const userProfileBaseSchema = z.object({
  id: uuidSchema,
  full_name: z.string().min(1, 'Full name is required').max(255).nullable().optional(),
  phone: z.string().regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Invalid Indonesian phone number').nullable().optional(),
  role: userRoleEnum,
  client_id: uuidSchema.nullable().optional(),
});

export const userProfileInsertSchema = userProfileBaseSchema;

export const userProfileUpdateSchema = userProfileBaseSchema.partial();

export const userProfileQuerySchema = z.object({
  id: uuidSchema.optional(),
  client_id: uuidSchema.nullable().optional(),
  role: userRoleEnum.optional(),
});

export const userProfileWithClientSchema = userProfileBaseSchema.extend({
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  clients: z.any().optional(),
});

export type UserProfile = z.infer<typeof userProfileBaseSchema> & {
  created_at: string;
  updated_at: string;
};

export type UserProfileInsert = z.infer<typeof userProfileInsertSchema>;
export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;
export type UserProfileQuery = z.infer<typeof userProfileQuerySchema>;
