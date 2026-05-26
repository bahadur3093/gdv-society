import { z, ZodSchema, ZodError, ZodIssue } from 'zod';
import { HttpStatus } from '@/types';

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Record<string, string[]> = {},
    public statusCode: number = HttpStatus.BAD_REQUEST
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate request data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @throws {ValidationError} If validation fails
 */
export function validateRequest<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors: Record<string, string[]> = {};
    result.error.issues.forEach((err: ZodIssue) => {
      const path = err.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(err.message);
    });

    throw new ValidationError('Validation failed', errors);
  }

  return result.data;
}

/**
 * Pagination schema for list endpoints
 * Accepts string query parameters and coerces them to numbers
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationParams = z.infer<typeof paginationSchema>;
