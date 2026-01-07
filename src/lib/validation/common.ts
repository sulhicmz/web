import { z } from 'zod';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const uuidSchema = z.string().regex(uuidRegex, 'Invalid UUID format');
export const emailSchema = z.string().regex(emailRegex, 'Invalid email format');
export const urlSchema = z.string().url('Invalid URL format').nullable().optional();
export const timestampSchema = z.string().datetime('Invalid timestamp format').or(z.date());
export const jsonbSchema = z.record(z.unknown());

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
});

export const sortingSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const filterSchema = z.object({
  search: z.string().optional(),
});

export type PaginationParams = z.infer<typeof paginationSchema>;
export type SortingParams = z.infer<typeof sortingSchema>;
export type FilterParams = z.infer<typeof filterSchema>;
