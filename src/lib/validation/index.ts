export * from './common';
export * from './clients';
export * from './projects';
export * from './invoices';
export * from './user-profiles';

import { z } from 'zod';

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map((err: z.ZodIssue) => ({
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

export function createValidationError(error: z.ZodError): Error {
  const formattedErrors = error.issues.map((err: z.ZodIssue) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));

  const err = new Error('Validation failed');
  err.name = 'ValidationError';
  (err as Error & { details: Array<{ field: string; message: string; code: string }> }).details = formattedErrors;

  return err;
}
