export * from './common';
export * from './clients';
export * from './projects';
export * from './invoices';
export * from './user-profiles';

import { z } from 'zod';

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
    
    throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
  }
  
  return result.data;
}

export function validateQueryParams<T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): T {
  const params: Record<string, unknown> = {};
  
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  
  return validateRequest(schema, params);
}

export function createValidationError(errors: z.ZodError): Error {
  const formattedErrors = errors.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
  
  const error = new Error(`Validation failed`);
  error.name = 'ValidationError';
  (error as Error & { details: Array<{ field: string; message: string; code: string }> }).details = formattedErrors;
  
  return error;
}
